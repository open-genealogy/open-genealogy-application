import { db } from "../index";
import { events, eventPersons } from "../schema";
import { eq } from "drizzle-orm";

export type PersonEvent = {
  id: string;
  kind: string;
  date_text: string | null;
  place: string | null;
  sources: unknown;
};

export async function getEventsForPerson(personId: string): Promise<PersonEvent[]> {
  const rows = await db
    .select({
      id: events.id,
      kind: events.kind,
      date_text: events.date_text,
      place: events.place,
      sources: events.sources,
    })
    .from(events)
    .innerJoin(eventPersons, eq(eventPersons.event_id, events.id))
    .where(eq(eventPersons.person_id, personId));

  return rows;
}
