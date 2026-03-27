"use server";

import { getPersonsByCountry, type PersonRow } from "@/db/queries/map";

export async function fetchPersonsByCountry(country: string): Promise<PersonRow[]> {
  return getPersonsByCountry(country);
}
