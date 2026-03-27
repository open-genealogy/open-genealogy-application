const COUNTRY_CODES: Record<string, string> = {
  FRANCE: "FR",
  BELGIQUE: "BE",
  BELGIUM: "BE",
  ITALIE: "IT",
  ITALY: "IT",
  ANGLETERRE: "GB",
  ENGLAND: "GB",
  "ROYAUME-UNI": "GB",
  "UNITED KINGDOM": "GB",
  ALLEMAGNE: "DE",
  GERMANY: "DE",
  GRECE: "GR",
  GREECE: "GR",
  TURQUIE: "TR",
  TURKEY: "TR",
  ISRAEL: "IL",
  NORVEGE: "NO",
  NORWAY: "NO",
  ESPAGNE: "ES",
  SPAIN: "ES",
  PORTUGAL: "PT",
  "PAYS-BAS": "NL",
  NETHERLANDS: "NL",
  SUISSE: "CH",
  SWITZERLAND: "CH",
  AUTRICHE: "AT",
  AUSTRIA: "AT",
  POLOGNE: "PL",
  POLAND: "PL",
  SUEDE: "SE",
  SWEDEN: "SE",
  DANEMARK: "DK",
  DENMARK: "DK",
  FINLANDE: "FI",
  FINLAND: "FI",
  RUSSIE: "RU",
  RUSSIA: "RU",
  "ETATS-UNIS": "US",
  "ÉTATS-UNIS": "US",
  "UNITED STATES": "US",
  CANADA: "CA",
  AUSTRALIE: "AU",
  AUSTRALIA: "AU",
  LUXEMBOURG: "LU",
  CROATIE: "HR",
  CROATIA: "HR",
  SERBIE: "RS",
  SERBIA: "RS",
  ROUMANIE: "RO",
  ROMANIA: "RO",
  BULGARIE: "BG",
  BULGARIA: "BG",
  HONGRIE: "HU",
  HUNGARY: "HU",
  TCHEQUE: "CZ",
  TCHEQUIE: "CZ",
  "REPUBLIQUE TCHEQUE": "CZ",
  SLOVAQUIE: "SK",
  SLOVAKIA: "SK",
  UKRAINE: "UA",
  BIELORUSSIE: "BY",
  BELARUS: "BY",
  MOLDAVIE: "MD",
  MOLDOVA: "MD",
  ESTONIE: "EE",
  ESTONIA: "EE",
  LETTONIE: "LV",
  LATVIA: "LV",
  LITUANIE: "LT",
  LITHUANIA: "LT",
  ALBANIE: "AL",
  ALBANIA: "AL",
};

function normalize(s: string): string {
  return s
    .toUpperCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

export function placeToCountryCode(place: string | null): string | null {
  if (!place) return null;
  const parts = place.split(",");
  // GEDCOM PLAC format: "City,Dept,Region,SubRegion,COUNTRY,"
  // Country is at index 4, fallback to last non-empty part
  let raw = parts.length >= 5 ? parts[4].trim() : "";
  if (!raw) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i].trim();
      if (p) {
        raw = p;
        break;
      }
    }
  }
  if (!raw) return null;
  const key = normalize(raw);
  return COUNTRY_CODES[key] ?? null;
}
