import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "fs";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { parseGedcomBuffer } from "../src/lib/ged-parser";
import { placeToCountryCode } from "../src/lib/country-codes";
import { persons, events, eventPersons, bonds } from "../src/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client);

const GED_PATH = resolve(
  __dirname,
  "../../Genealogie_demey.ged",
);

async function main() {
  console.log("Reading GED file…");
  const buffer = readFileSync(GED_PATH);

  console.log("Parsing GEDCOM…");
  const { individuals, families } = await parseGedcomBuffer(buffer);
  console.log(`Found ${individuals.size} individuals, ${families.size} families`);

  // Clear existing data (order matters due to FK)
  console.log("Clearing existing data…");
  await db.delete(eventPersons);
  await db.delete(bonds);
  await db.delete(events);
  await db.delete(persons);

  // Insert persons in batches
  console.log("Inserting persons…");
  const personRows = Array.from(individuals.values()).map((ind) => ({
    id: ind.id,
    given_name: ind.given_name ?? null,
    family_name: ind.family_name ?? null,
    sex: ind.sex ?? null,
    visibility: "public" as const,
    occupation: ind.occupation ?? null,
    tags: null,
  }));

  const BATCH = 500;
  for (let i = 0; i < personRows.length; i += BATCH) {
    await db.insert(persons).values(personRows.slice(i, i + BATCH)).onConflictDoNothing();
  }
  console.log(`Inserted ${personRows.length} persons`);

  // Build events from individuals
  console.log("Inserting events…");
  const eventRows: Array<{ id: string; kind: string; date_text: string | null; place: string | null; country: string | null; sources: unknown }> = [];
  const epRows: Array<{ event_id: string; person_id: string }> = [];

  let eventCounter = 0;
  for (const ind of individuals.values()) {
    for (const ev of ind.events) {
      const eventId = `evt_${ind.id}_${eventCounter++}`;
      eventRows.push({
        id: eventId,
        kind: ev.kind,
        date_text: ev.date?.raw ?? null,
        place: ev.place ?? null,
        country: placeToCountryCode(ev.place ?? null),
        sources: ev.sources.length > 0 ? ev.sources : null,
      });
      epRows.push({ event_id: eventId, person_id: ind.id });
    }
  }

  // Events from families (marriage etc.)
  for (const fam of families.values()) {
    const participants: string[] = [];
    if (fam.husband) participants.push(fam.husband);
    if (fam.wife) participants.push(fam.wife);

    for (const ev of fam.events) {
      const eventId = `evt_${fam.id}_${eventCounter++}`;
      eventRows.push({
        id: eventId,
        kind: ev.kind,
        date_text: ev.date?.raw ?? null,
        place: ev.place ?? null,
        country: placeToCountryCode(ev.place ?? null),
        sources: ev.sources.length > 0 ? ev.sources : null,
      });
      for (const pid of participants) {
        if (individuals.has(pid)) {
          epRows.push({ event_id: eventId, person_id: pid });
        }
      }
    }
  }

  for (let i = 0; i < eventRows.length; i += BATCH) {
    await db.insert(events).values(eventRows.slice(i, i + BATCH)).onConflictDoNothing();
  }
  for (let i = 0; i < epRows.length; i += BATCH) {
    // Filter out event_persons where person_id doesn't exist
    const validEp = epRows.slice(i, i + BATCH).filter((ep) => individuals.has(ep.person_id));
    if (validEp.length > 0) {
      await db.insert(eventPersons).values(validEp).onConflictDoNothing();
    }
  }
  console.log(`Inserted ${eventRows.length} events, ${epRows.length} event-person links`);

  // Build bonds from families
  console.log("Inserting bonds…");
  const bondRows: Array<{
    id: string;
    kind: string;
    subject_id: string;
    object_id: string;
    certainty: string | null;
    sources: unknown;
    family_ref: string;
  }> = [];

  let bondCounter = 0;
  for (const fam of families.values()) {
    // Union bond: husband ↔ wife
    if (fam.husband && fam.wife && individuals.has(fam.husband) && individuals.has(fam.wife)) {
      bondRows.push({
        id: `bond_${fam.id}_union`,
        kind: "union",
        subject_id: fam.husband,
        object_id: fam.wife,
        certainty: null,
        sources: fam.sources.length > 0 ? fam.sources : null,
        family_ref: fam.id,
      });
    }

    // Filiation bonds: each child ↔ father and child ↔ mother
    for (const childId of fam.children) {
      if (!individuals.has(childId)) continue;

      if (fam.husband && individuals.has(fam.husband)) {
        bondRows.push({
          id: `bond_${fam.id}_fil_${childId}_husb_${bondCounter++}`,
          kind: "filiation",
          subject_id: childId,
          object_id: fam.husband,
          certainty: null,
          sources: null,
          family_ref: fam.id,
        });
      }

      if (fam.wife && individuals.has(fam.wife)) {
        bondRows.push({
          id: `bond_${fam.id}_fil_${childId}_wife_${bondCounter++}`,
          kind: "filiation",
          subject_id: childId,
          object_id: fam.wife,
          certainty: null,
          sources: null,
          family_ref: fam.id,
        });
      }
    }
  }

  for (let i = 0; i < bondRows.length; i += BATCH) {
    await db.insert(bonds).values(bondRows.slice(i, i + BATCH)).onConflictDoNothing();
  }
  console.log(`Inserted ${bondRows.length} bonds`);

  await client.end();
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
