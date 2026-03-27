import { Container, Heading, Flex, TextField, Grid, Text, Box, Button } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { getPersons } from "@/db/queries/persons";
import { getDistinctCountries, getYearRange } from "@/db/queries/map";
import { PersonCard } from "@/components/PersonCard";
import { CountryTagSelect } from "@/components/CountryTagSelect";

const countryDisplayNames = new Intl.DisplayNames(["fr"], { type: "region" });

export default async function PersonsPage(props: PageProps<"/persons">) {
  const searchParams = await props.searchParams;

  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const page = parseInt(
    typeof searchParams.page === "string" ? searchParams.page : "1",
    10,
  );
  const rawCountries = searchParams.country;
  const selectedCountries = Array.isArray(rawCountries)
    ? rawCountries
    : rawCountries
      ? [rawCountries]
      : [];
  const yearFrom =
    typeof searchParams.yearFrom === "string"
      ? parseInt(searchParams.yearFrom, 10)
      : undefined;
  const yearTo =
    typeof searchParams.yearTo === "string"
      ? parseInt(searchParams.yearTo, 10)
      : undefined;

  const pageSize = 50;

  const [{ data: personList, total }, availableCountries, yearRange] =
    await Promise.all([
      getPersons({ q, countries: selectedCountries, yearFrom, yearTo, page, pageSize }),
      getDistinctCountries(),
      getYearRange(),
    ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Container size="4" px="4" py="6">
      <Heading size="6" mb="4">
        Généalogie — {total} personnes
      </Heading>

      <FilterForm
        q={q}
        selectedCountries={selectedCountries}
        yearFrom={yearFrom}
        yearTo={yearTo}
        availableCountries={availableCountries}
        yearRange={yearRange}
      />

      <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="3" mt="5">
        {personList.map((person) => (
          <PersonCard
            key={person.id}
            id={person.id}
            given_name={person.given_name}
            family_name={person.family_name}
            sex={person.sex}
          />
        ))}
      </Grid>

      {personList.length === 0 && (
        <Text color="gray" mt="4">
          Aucun résultat pour ces critères.
        </Text>
      )}

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          q={q}
          selectedCountries={selectedCountries}
          yearFrom={yearFrom}
          yearTo={yearTo}
        />
      )}
    </Container>
  );
}

function FilterForm({
  q,
  selectedCountries,
  yearFrom,
  yearTo,
  availableCountries,
  yearRange,
}: Readonly<{
  q: string;
  selectedCountries: string[];
  yearFrom: number | undefined;
  yearTo: number | undefined;
  availableCountries: string[];
  yearRange: { min: number; max: number };
}>) {
  return (
    <form method="get">
      <Flex direction="column" gap="4" style={{ maxWidth: "640px" }}>
        <TextField.Root
          name="q"
          defaultValue={q}
          placeholder="Rechercher par nom ou prénom…"
        >
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>

        <Box>
          <Text as="label" size="2" weight="bold" mb="2" style={{ display: "block" }}>
            Pays
          </Text>
          <CountryTagSelect
            availableCountries={availableCountries}
            defaultSelected={selectedCountries}
            countryNames={Object.fromEntries(
              availableCountries.map((code) => [code, countryDisplayNames.of(code) ?? code])
            )}
          />
        </Box>

        <Flex gap="4" wrap="wrap">
          <Box style={{ flex: 1, minWidth: "140px" }}>
            <Text as="label" size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Année de début
            </Text>
            <input
              type="number"
              name="yearFrom"
              defaultValue={yearFrom ?? yearRange.min}
              min={yearRange.min}
              max={yearRange.max}
              style={{
                width: "100%",
                borderRadius: "var(--radius-2)",
                border: "1px solid var(--gray-6)",
                padding: "6px 8px",
                fontSize: "14px",
                background: "var(--color-surface)",
                color: "var(--gray-12)",
              }}
            />
          </Box>
          <Box style={{ flex: 1, minWidth: "140px" }}>
            <Text as="label" size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Année de fin
            </Text>
            <input
              type="number"
              name="yearTo"
              defaultValue={yearTo ?? yearRange.max}
              min={yearRange.min}
              max={yearRange.max}
              style={{
                width: "100%",
                borderRadius: "var(--radius-2)",
                border: "1px solid var(--gray-6)",
                padding: "6px 8px",
                fontSize: "14px",
                background: "var(--color-surface)",
                color: "var(--gray-12)",
              }}
            />
          </Box>
        </Flex>

        <Flex gap="2">
          <Button type="submit" size="2">
            Filtrer
          </Button>
          <Button type="reset" size="2" variant="outline" asChild>
            <Link href="/persons">Réinitialiser</Link>
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}

function buildHref(params: {
  page: number;
  q: string;
  selectedCountries: string[];
  yearFrom: number | undefined;
  yearTo: number | undefined;
}): string {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  if (params.q) qs.set("q", params.q);
  params.selectedCountries.forEach((c) => qs.append("country", c));
  if (params.yearFrom !== undefined) qs.set("yearFrom", String(params.yearFrom));
  if (params.yearTo !== undefined) qs.set("yearTo", String(params.yearTo));
  return `/persons?${qs.toString()}`;
}

function Pagination({
  page,
  totalPages,
  q,
  selectedCountries,
  yearFrom,
  yearTo,
}: Readonly<{
  page: number;
  totalPages: number;
  q: string;
  selectedCountries: string[];
  yearFrom: number | undefined;
  yearTo: number | undefined;
}>) {
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <Flex gap="3" justify="center" mt="6">
      {prev !== null ? (
        <Link href={buildHref({ page: prev, q, selectedCountries, yearFrom, yearTo })}>
          ← Précédent
        </Link>
      ) : (
        <Text color="gray">← Précédent</Text>
      )}
      <Text>
        Page {page} / {totalPages}
      </Text>
      {next !== null ? (
        <Link href={buildHref({ page: next, q, selectedCountries, yearFrom, yearTo })}>
          Suivant →
        </Link>
      ) : (
        <Text color="gray">Suivant →</Text>
      )}
    </Flex>
  );
}
