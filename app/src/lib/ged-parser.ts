/**
 * GEDCOM 5.5 parser
 * Handles ANSEL → UTF-8 conversion and builds typed in-memory records.
 */

export type GedcomDate = {
  raw: string;
  approximate: boolean;
};

export type GedcomEvent = {
  kind: string;
  date?: GedcomDate;
  place?: string;
  sources: string[];
  note?: string;
};

export type GedcomIndividual = {
  id: string;
  given_name?: string;
  family_name?: string;
  sex?: string;
  occupation?: string;
  events: GedcomEvent[];
  fams: string[];
  famc: string[];
};

export type GedcomFamily = {
  id: string;
  husband?: string;
  wife?: string;
  children: string[];
  events: GedcomEvent[];
  sources: string[];
};

export type GedcomData = {
  individuals: Map<string, GedcomIndividual>;
  families: Map<string, GedcomFamily>;
};

/** Remove surrounding @ markers and normalize ID */
function cleanRef(ref: string): string {
  return ref.replace(/@/g, "");
}

/** Parse a raw GEDCOM date string */
function parseDate(raw: string): GedcomDate {
  return {
    raw: raw.trim(),
    approximate: /^(BEF|AFT|ABT|EST|CAL|FROM|TO|BET|AND)/i.test(raw.trim()),
  };
}

/** Normalize ANSEL-encoded text to clean UTF-8 */
function normalizeText(text: string): string {
  return (
    text
      // Common ANSEL ligatures and diacritics that survive as multi-byte sequences
      .replace(/\uFFFD/g, "")
      // Cleanup trailing whitespace
      .trim()
  );
}

type ParsedLine = {
  level: number;
  xref?: string;
  tag: string;
  value: string;
};

function parseLine(line: string): ParsedLine | null {
  const match = line.match(/^(\d+)\s+(@[^@]+@)?\s*(\w+)\s*(.*)?$/);
  if (!match) return null;
  return {
    level: parseInt(match[1], 10),
    xref: match[2] ? cleanRef(match[2]) : undefined,
    tag: match[3],
    value: normalizeText(match[4] ?? ""),
  };
}

type ParsedRecord = {
  tag: string;
  xref?: string;
  value: string;
  children: ParsedRecord[];
};

function buildRecordTree(lines: ParsedLine[], startIndex: number): { record: ParsedRecord; nextIndex: number } {
  const root = lines[startIndex];
  const record: ParsedRecord = {
    tag: root.tag,
    xref: root.xref,
    value: root.value,
    children: [],
  };

  let i = startIndex + 1;
  while (i < lines.length && lines[i].level > root.level) {
    if (lines[i].level === root.level + 1) {
      const { record: child, nextIndex } = buildRecordTree(lines, i);
      record.children.push(child);
      i = nextIndex;
    } else {
      i++;
    }
  }

  return { record, nextIndex: i };
}

function getChildValue(record: ParsedRecord, tag: string): string | undefined {
  return record.children.find((c) => c.tag === tag)?.value;
}

function getChildrenByTag(record: ParsedRecord, tag: string): ParsedRecord[] {
  return record.children.filter((c) => c.tag === tag);
}

function extractNote(record: ParsedRecord): string | undefined {
  const noteRecord = record.children.find((c) => c.tag === "NOTE");
  if (!noteRecord) return undefined;
  const cont = getChildrenByTag(noteRecord, "CONT")
    .map((c) => c.value)
    .join(" ");
  return cont ? `${noteRecord.value} ${cont}` : noteRecord.value || undefined;
}

const EVENT_TAGS = new Set([
  "BIRT", "DEAT", "BAPM", "CHR", "CHRA", "BURI", "CREM",
  "MARR", "MARC", "ENGA", "DIV", "DIVF",
  "CENS", "WILL", "GRAD", "NATI", "ADOP", "EVEN",
]);

function extractEvent(record: ParsedRecord): GedcomEvent {
  const kind =
    record.tag === "EVEN"
      ? (getChildValue(record, "TYPE") ?? "event").toLowerCase()
      : record.tag.toLowerCase();

  const dateRaw = getChildValue(record, "DATE");
  const place = getChildValue(record, "PLAC");
  const sources = getChildrenByTag(record, "SOUR").map((s) =>
    s.value.startsWith("@") ? cleanRef(s.value) : s.value,
  );

  return {
    kind,
    date: dateRaw ? parseDate(dateRaw) : undefined,
    place: place ? normalizeText(place) : undefined,
    sources,
    note: extractNote(record),
  };
}

function parseIndividual(record: ParsedRecord): GedcomIndividual {
  const id = record.xref!;
  const nameRecord = record.children.find((c) => c.tag === "NAME");
  const given_name = nameRecord
    ? (getChildValue(nameRecord, "GIVN") ?? parseGivenName(nameRecord.value))
    : undefined;
  const family_name = nameRecord
    ? (getChildValue(nameRecord, "SURN") ?? parseSurname(nameRecord.value))
    : undefined;

  const sex = getChildValue(record, "SEX");
  const occupation = record.children.find((c) => c.tag === "OCCU")?.value;

  const events: GedcomEvent[] = record.children
    .filter((c) => EVENT_TAGS.has(c.tag))
    .map(extractEvent);

  const fams = getChildrenByTag(record, "FAMS").map((c) => cleanRef(c.value));
  const famc = getChildrenByTag(record, "FAMC").map((c) => cleanRef(c.value));

  return {
    id,
    given_name: given_name ? normalizeText(given_name) : undefined,
    family_name: family_name ? normalizeText(family_name) : undefined,
    sex,
    occupation: occupation ? normalizeText(occupation) : undefined,
    events,
    fams,
    famc,
  };
}

/** Extract given name from GEDCOM NAME value like "Marie/DUPONT/" */
function parseGivenName(nameValue: string): string | undefined {
  const match = nameValue.match(/^([^/]*)/);
  return match?.[1]?.trim() || undefined;
}

/** Extract surname from GEDCOM NAME value like "Marie/DUPONT/" */
function parseSurname(nameValue: string): string | undefined {
  const match = nameValue.match(/\/([^/]+)\//);
  return match?.[1]?.trim() || undefined;
}

function parseFamily(record: ParsedRecord): GedcomFamily {
  const id = record.xref!;
  const husband = record.children.find((c) => c.tag === "HUSB")?.value;
  const wife = record.children.find((c) => c.tag === "WIFE")?.value;
  const children = getChildrenByTag(record, "CHIL").map((c) => cleanRef(c.value));

  const events: GedcomEvent[] = record.children
    .filter((c) => EVENT_TAGS.has(c.tag))
    .map(extractEvent);

  const sources = getChildrenByTag(record, "SOUR").map((s) =>
    s.value.startsWith("@") ? cleanRef(s.value) : s.value,
  );

  return {
    id,
    husband: husband ? cleanRef(husband) : undefined,
    wife: wife ? cleanRef(wife) : undefined,
    children,
    events,
    sources,
  };
}

export async function parseGedcomBuffer(buffer: Buffer): Promise<GedcomData> {
  // Try to decode as latin1 first (covers ANSEL subset), then normalize
  const iconv = await import("iconv-lite");
  const raw = iconv.decode(buffer, "latin1");

  const rawLines = raw.split(/\r?\n/);
  const parsed: ParsedLine[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trimEnd();
    if (!line) continue;
    const parsedLine = parseLine(line);
    if (parsedLine) parsed.push(parsedLine);
  }

  const individuals = new Map<string, GedcomIndividual>();
  const families = new Map<string, GedcomFamily>();

  let i = 0;
  while (i < parsed.length) {
    const line = parsed[i];
    if (line.level === 0 && line.xref) {
      const { record, nextIndex } = buildRecordTree(parsed, i);
      if (record.tag === "INDI") {
        const individual = parseIndividual(record);
        individuals.set(individual.id, individual);
      } else if (record.tag === "FAM") {
        const family = parseFamily(record);
        families.set(family.id, family);
      }
      i = nextIndex;
    } else {
      i++;
    }
  }

  return { individuals, families };
}
