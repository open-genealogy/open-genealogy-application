import { db } from "../index";
import { bonds, persons } from "../schema";
import { eq, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export type RelatedPerson = {
  id: string;
  given_name: string | null;
  family_name: string | null;
  sex: string | null;
};

export type PersonRelations = {
  parents: RelatedPerson[];
  children: RelatedPerson[];
  spouses: RelatedPerson[];
};

export async function getRelationsForPerson(personId: string): Promise<PersonRelations> {
  const subjectPersons = alias(persons, "subject_person");
  const objectPersons = alias(persons, "object_person");

  const allBonds = await db
    .select({
      bond_id: bonds.id,
      kind: bonds.kind,
      subject_id: bonds.subject_id,
      object_id: bonds.object_id,
      subject_given: subjectPersons.given_name,
      subject_family: subjectPersons.family_name,
      subject_sex: subjectPersons.sex,
      object_given: objectPersons.given_name,
      object_family: objectPersons.family_name,
      object_sex: objectPersons.sex,
    })
    .from(bonds)
    .leftJoin(subjectPersons, eq(bonds.subject_id, subjectPersons.id))
    .leftJoin(objectPersons, eq(bonds.object_id, objectPersons.id))
    .where(
      or(eq(bonds.subject_id, personId), eq(bonds.object_id, personId)),
    );

  const parents: RelatedPerson[] = [];
  const children: RelatedPerson[] = [];
  const spouses: RelatedPerson[] = [];

  for (const row of allBonds) {
    if (row.kind === "filiation") {
      if (row.subject_id === personId) {
        // person is child → object is parent
        parents.push({
          id: row.object_id,
          given_name: row.object_given ?? null,
          family_name: row.object_family ?? null,
          sex: row.object_sex ?? null,
        });
      } else {
        // person is parent → subject is child
        children.push({
          id: row.subject_id,
          given_name: row.subject_given ?? null,
          family_name: row.subject_family ?? null,
          sex: row.subject_sex ?? null,
        });
      }
    } else if (row.kind === "union") {
      const other =
        row.subject_id === personId
          ? {
              id: row.object_id,
              given_name: row.object_given ?? null,
              family_name: row.object_family ?? null,
              sex: row.object_sex ?? null,
            }
          : {
              id: row.subject_id,
              given_name: row.subject_given ?? null,
              family_name: row.subject_family ?? null,
              sex: row.subject_sex ?? null,
            };
      spouses.push(other);
    }
  }

  return { parents, children, spouses };
}
