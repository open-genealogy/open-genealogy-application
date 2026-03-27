import { db } from "../index";
import { events, eventPersons, persons } from "../schema";
import { eq, isNotNull, sql } from "drizzle-orm";

export async function getPersonCountByCountry(): Promise<Record<string, number>> {
  const rows = await db
    .select({
      country: events.country,
      count: sql<number>`count(distinct ${eventPersons.person_id})::int`,
    })
    .from(events)
    .innerJoin(eventPersons, eq(eventPersons.event_id, events.id))
    .where(isNotNull(events.country))
    .groupBy(events.country);

  return Object.fromEntries(rows.map((r) => [r.country as string, r.count]));
}

export type PersonRow = {
  id: string;
  given_name: string | null;
  family_name: string | null;
};

export async function getPersonsByCountry(country: string): Promise<PersonRow[]> {
  const rows = await db
    .selectDistinct({
      id: persons.id,
      given_name: persons.given_name,
      family_name: persons.family_name,
    })
    .from(persons)
    .innerJoin(eventPersons, eq(eventPersons.person_id, persons.id))
    .innerJoin(events, eq(events.id, eventPersons.event_id))
    .where(eq(events.country, country))
    .orderBy(persons.family_name, persons.given_name);

  return rows;
}
