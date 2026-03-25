import { Table, Text } from "@radix-ui/themes";
import type { PersonEvent } from "@/db/queries/events";

const EVENT_LABELS: Record<string, string> = {
  birt: "Naissance",
  deat: "Décès",
  bapm: "Baptême",
  chr: "Baptême",
  buri: "Inhumation",
  crem: "Crémation",
  marr: "Mariage",
  marc: "Contrat de mariage",
  enga: "Fiançailles",
  div: "Divorce",
  cens: "Recensement",
  will: "Testament",
  adop: "Adoption",
  even: "Événement",
};

type Props = Readonly<{
  events: PersonEvent[];
}>;

export function EventList({ events }: Props) {
  if (events.length === 0) {
    return <Text color="gray" size="2">Aucun événement enregistré.</Text>;
  }

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Lieu</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {events.map((ev) => (
          <Table.Row key={ev.id}>
            <Table.Cell>
              <Text size="2">{EVENT_LABELS[ev.kind] ?? ev.kind}</Text>
            </Table.Cell>
            <Table.Cell>
              <Text size="2">{ev.date_text ?? "—"}</Text>
            </Table.Cell>
            <Table.Cell>
              <Text size="2">{ev.place ? formatPlace(ev.place) : "—"}</Text>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

/** Format GEDCOM place "Lille,59,Nord,,FRANCE," → "Lille, Nord, FRANCE" */
function formatPlace(place: string): string {
  return place
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .join(", ");
}
