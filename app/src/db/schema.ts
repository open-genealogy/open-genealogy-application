import { pgTable, text, jsonb, primaryKey } from "drizzle-orm/pg-core";

export const persons = pgTable("persons", {
  id: text("id").primaryKey(),
  given_name: text("given_name"),
  family_name: text("family_name"),
  sex: text("sex"),
  visibility: text("visibility").notNull().default("public"),
  occupation: text("occupation"),
  tags: jsonb("tags"),
});

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  date_text: text("date_text"),
  place: text("place"),
  sources: jsonb("sources"),
});

export const eventPersons = pgTable(
  "event_persons",
  {
    event_id: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    person_id: text("person_id")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.event_id, table.person_id] })],
);

export const bonds = pgTable("bonds", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  subject_id: text("subject_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  object_id: text("object_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  certainty: text("certainty"),
  sources: jsonb("sources"),
  family_ref: text("family_ref"),
});

export type Person = typeof persons.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Bond = typeof bonds.$inferSelect;
