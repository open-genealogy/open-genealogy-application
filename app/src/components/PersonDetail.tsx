import { Heading, Text, Flex, Box, Separator, Grid } from "@radix-ui/themes";
import type { Person } from "@/db/schema";
import type { PersonEvent } from "@/db/queries/events";
import type { PersonRelations } from "@/db/queries/bonds";
import { EventList } from "./EventList";
import { PersonCard } from "./PersonCard";

type Props = Readonly<{
  person: Person;
  events: PersonEvent[];
  relations: PersonRelations;
}>;

export function PersonDetail({ person, events, relations }: Props) {
  const fullName =
    [person.given_name, person.family_name].filter(Boolean).join(" ") ||
    "Inconnu";

  const birthEvent = events.find((e) => e.kind === "birt");
  const deathEvent = events.find((e) => e.kind === "deat");

  return (
    <Box>
      <Heading size="7" mb="1">
        {fullName}
      </Heading>

      <Flex gap="3" mb="4" align="center">
        {person.sex && (
          <Text color="gray" size="2">
            {person.sex === "M" ? "Homme" : person.sex === "F" ? "Femme" : person.sex}
          </Text>
        )}
        {birthEvent?.date_text && (
          <Text size="2" color="gray">
            Né(e) {birthEvent.date_text}
            {birthEvent.place ? ` à ${formatPlace(birthEvent.place)}` : ""}
          </Text>
        )}
        {deathEvent?.date_text && (
          <Text size="2" color="gray">
            Décédé(e) {deathEvent.date_text}
            {deathEvent.place ? ` à ${formatPlace(deathEvent.place)}` : ""}
          </Text>
        )}
        {person.occupation && (
          <Text size="2" color="gray">
            {person.occupation}
          </Text>
        )}
      </Flex>

      <Separator size="4" mb="4" />

      <Box mb="5">
        <Heading size="4" mb="3">Événements</Heading>
        <EventList events={events} />
      </Box>

      <Separator size="4" mb="4" />

      <Grid columns={{ initial: "1", sm: "3" }} gap="5">
        <RelationSection
          title="Parents"
          persons={relations.parents}
          emptyLabel="Parents inconnus"
        />
        <RelationSection
          title="Conjoints"
          persons={relations.spouses}
          emptyLabel="Aucun conjoint enregistré"
        />
        <RelationSection
          title={`Enfants (${relations.children.length})`}
          persons={relations.children}
          emptyLabel="Aucun enfant enregistré"
        />
      </Grid>
    </Box>
  );
}

type RelationSectionProps = Readonly<{
  title: string;
  persons: Array<{ id: string; given_name: string | null; family_name: string | null; sex: string | null }>;
  emptyLabel: string;
}>;

function RelationSection({ title, persons, emptyLabel }: RelationSectionProps) {
  return (
    <Box>
      <Heading size="3" mb="2">{title}</Heading>
      {persons.length === 0 ? (
        <Text color="gray" size="2">{emptyLabel}</Text>
      ) : (
        <Flex direction="column" gap="2">
          {persons.map((p) => (
            <PersonCard
              key={p.id}
              id={p.id}
              given_name={p.given_name}
              family_name={p.family_name}
              sex={p.sex}
            />
          ))}
        </Flex>
      )}
    </Box>
  );
}

function formatPlace(place: string): string {
  return place
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .join(", ");
}
