import { db } from "../index";
import { persons } from "../schema";
import { ilike, or, sql } from "drizzle-orm";

export type PersonListItem = {
  id: string;
  given_name: string | null;
  family_name: string | null;
  sex: string | null;
};

export async function getPersons(params: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: PersonListItem[]; total: number }> {
  const { q, page = 1, pageSize = 50 } = params;
  const offset = (page - 1) * pageSize;

  const baseQuery = db
    .select({
      id: persons.id,
      given_name: persons.given_name,
      family_name: persons.family_name,
      sex: persons.sex,
    })
    .from(persons);

  const countQuery = db.select({ count: sql<number>`count(*)` }).from(persons);

  if (q && q.trim()) {
    const term = `%${q.trim()}%`;
    const condition = or(
      ilike(persons.given_name, term),
      ilike(persons.family_name, term),
    );
    const [data, countResult] = await Promise.all([
      baseQuery.where(condition).limit(pageSize).offset(offset),
      countQuery.where(condition),
    ]);
    return { data, total: Number(countResult[0]?.count ?? 0) };
  }

  const [data, countResult] = await Promise.all([
    baseQuery.limit(pageSize).offset(offset),
    countQuery,
  ]);
  return { data, total: Number(countResult[0]?.count ?? 0) };
}

export async function getPersonById(id: string) {
  const result = await db.select().from(persons).where(sql`${persons.id} = ${id}`);
  return result[0] ?? null;
}
