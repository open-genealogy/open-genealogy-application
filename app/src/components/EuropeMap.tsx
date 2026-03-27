"use client";

import { useReducer } from "react";
import Link from "next/link";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { fetchPersonsByCountry } from "@/app/map/actions";
import { reducer, initialState } from "./EuropeMap.reducer";

const GEO_URL = "/europe.geojson";

type Props = Readonly<{
  countryCounts: Record<string, number>;
}>;

function getColor(count: number, maxCount: number): string {
  if (count === 0) return "#e8e8e8";
  const t = count / maxCount;
  const r = Math.round(230 - 230 * t);
  const g = Math.round(240 - 189 * t);
  const b = Math.round(255 - 127 * t);
  return `rgb(${r},${g},${b})`;
}

export function EuropeMap({ countryCounts }: Props) {
  const maxCount = Math.max(...Object.values(countryCounts), 1);
  const [state, dispatch] = useReducer(reducer, initialState);

  async function handleCountryClick(code: string, name: string) {
    if (state.selectedCountryCode === code) {
      dispatch({ type: "CLEAR" });
      return;
    }
    dispatch({ type: "SELECT", code, name });
    const persons = await fetchPersonsByCountry(code);
    dispatch({ type: "LOADED", persons });
  }

  return (
    <div>
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={{
          rotate: [-10.0, -52.0, 0],
          center: [-5, -3],
          scale: 1100,
        }}
        style={{ width: "100%", maxWidth: "900px", display: "block" }}
      >
        <Geographies geography={GEO_URL} stroke="#666" strokeWidth={0.5}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const iso = geo.properties.ISO2 as string;
              const name = geo.properties.NAME as string;
              const count = countryCounts[iso] ?? 0;
              const isSelected = state.selectedCountryCode === iso;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isSelected ? "#b0c4de" : getColor(count, maxCount)}
                  style={{
                    default: { outline: "none", cursor: count > 0 ? "pointer" : "default" },
                    hover: { fill: "#b0c4de", outline: "none", cursor: count > 0 ? "pointer" : "default" },
                    pressed: { outline: "none" },
                  }}
                  onClick={() => count > 0 && handleCountryClick(iso, name)}
                >
                  <title>
                    {name}: {count.toLocaleString("fr-FR")} personne
                    {count !== 1 ? "s" : ""}
                  </title>
                </Geography>
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <Legend maxCount={maxCount} />
      {state.selectedCountryCode && (
        <CountryPersonsTable
          countryName={state.selectedCountryName!}
          persons={state.persons}
          loading={state.loading}
        />
      )}
    </div>
  );
}

function Legend({ maxCount }: Readonly<{ maxCount: number }>) {
  const steps = 6;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "12px",
        fontSize: "13px",
        color: "var(--gray-11)",
      }}
    >
      <span>0</span>
      {Array.from({ length: steps }, (_, i) => {
        const t = i / (steps - 1);
        const r = Math.round(230 - 230 * t);
        const g = Math.round(240 - 189 * t);
        const b = Math.round(255 - 127 * t);
        return (
          <div
            key={i}
            style={{
              width: "36px",
              height: "16px",
              background: `rgb(${r},${g},${b})`,
              border: "1px solid #999",
              borderRadius: "2px",
            }}
          />
        );
      })}
      <span>{maxCount.toLocaleString("fr-FR")}</span>
    </div>
  );
}

type CountryPersonsTableProps = Readonly<{
  countryName: string;
  persons: { id: string; given_name: string | null; family_name: string | null }[];
  loading: boolean;
}>;

function CountryPersonsTable({ countryName, persons, loading }: CountryPersonsTableProps) {
  return (
    <div style={{ marginTop: "24px", maxWidth: "480px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
        {countryName} — {persons.length.toLocaleString("fr-FR")} personne
        {persons.length !== 1 ? "s" : ""}
      </h3>
      {loading ? (
        <p style={{ fontSize: "14px", color: "var(--gray-9)" }}>Chargement…</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "6px 12px", borderBottom: "2px solid var(--gray-6)", fontSize: "13px" }}>
                Nom
              </th>
            </tr>
          </thead>
          <tbody>
            {persons.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--gray-4)" }}>
                <td style={{ padding: "6px 12px", fontSize: "14px" }}>
                  <Link
                    href={`/persons/${p.id}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                  >
                    {p.given_name ?? "—"} {p.family_name ?? "—"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
