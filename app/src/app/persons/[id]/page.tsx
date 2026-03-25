import { notFound } from "next/navigation";
import { Container, Box, Link as RadixLink } from "@radix-ui/themes";
import Link from "next/link";
import { getPersonById } from "@/db/queries/persons";
import { getEventsForPerson } from "@/db/queries/events";
import { getRelationsForPerson } from "@/db/queries/bonds";
import { PersonDetail } from "@/components/PersonDetail";

export default async function PersonPage(props: PageProps<"/persons/[id]">) {
  const { id } = await props.params;

  const [person, events, relations] = await Promise.all([
    getPersonById(id),
    getEventsForPerson(id),
    getRelationsForPerson(id),
  ]);

  if (!person) {
    notFound();
  }

  return (
    <Container size="3" px="4" py="6">
      <Box mb="4">
        <Link href="/persons" passHref legacyBehavior>
          <RadixLink size="2">← Retour à la liste</RadixLink>
        </Link>
      </Box>
      <PersonDetail person={person} events={events} relations={relations} />
    </Container>
  );
}
