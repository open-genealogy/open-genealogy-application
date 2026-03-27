import { db } from "../index";
import { persons, events, eventPersons } from "../schema";
import { ilike, or, and, sql, inArray, eq, isNotNull } from "drizzle-orm";

export type PersonListItem = {
  id: string;
  given_name: string | null;
  family_name: string | null;
  sex: string | null;
};

export async function getPersons(params: {
  q?: string;
  countries?: string[];
  yearFrom?: number;
  yearTo?: number;
  page?: number;
  pageSize?: number;
}): Promise<{ data: PersonListItem[]; total: number }> {
  const { q, countries, yearFrom, yearTo, page = 1, pageSize = 50 } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [];

  if (q && q.trim()) {
    const term = `%${q.trim()}%`;
    conditions.push(
      or(ilike(persons.given_name, term), ilike(persons.family_name, term)),
    );
  }

  const hasCountryFilter = countries && countries.length > 0;
  const hasYearFilter = yearFrom !== undefined || yearTo !== undefined;

  if (hasCountryFilter || hasYearFilter) {
    const eventConditions = [];

    if (hasCountryFilter) {
      eventConditions.push(inArray(events.country, countries!));
    }
    if (yearFrom !== undefined) {
      eventConditions.push(
        sql`CAST(substring(${events.date_text} FROM '[0-9]{4}') AS integer) >= ${yearFrom}`,
      );
    }
    if (yearTo !== undefined) {
      eventConditions.push(
        sql`CAST(substring(${events.date_text} FROM '[0-9]{4}') AS integer) <= ${yearTo}`,
      );
    }

    const personIdsSubquery = db
      .selectDistinct({ person_id: eventPersons.person_id })
      .from(eventPersons)
      .innerJoin(events, eq(events.id, eventPersons.event_id))
      .where(and(...eventConditions));

    conditions.push(inArray(persons.id, personIdsSubquery));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const baseSelect = {
    id: persons.id,
    given_name: persons.given_name,
    family_name: persons.family_name,
    sex: persons.sex,
  };

  const [data, countResult] = await Promise.all([
    db.select(baseSelect).from(persons).where(whereClause).limit(pageSize).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(persons).where(whereClause),
  ]);

  return { data, total: Number(countResult[0]?.count ?? 0) };
}

export async function getPersonById(id: string) {
  const result = await db.select().from(persons).where(sql`${persons.id} = ${id}`);
  return result[0] ?? null;
}
