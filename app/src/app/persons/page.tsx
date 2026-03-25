import { Container, Heading, Flex, TextField, Grid, Text } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { getPersons } from "@/db/queries/persons";
import { PersonCard } from "@/components/PersonCard";

export default async function PersonsPage(props: PageProps<"/persons">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const page = parseInt(typeof searchParams.page === "string" ? searchParams.page : "1", 10);
  const pageSize = 50;

  const { data: personList, total } = await getPersons({ q, page, pageSize });
  const totalPages = Math.ceil(total / pageSize);

  return (
    <Container size="4" px="4" py="6">
      <Heading size="6" mb="4">
        Généalogie — {total} personnes
      </Heading>

      <SearchForm defaultValue={q} />

      <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="3" mt="5">
        {personList.map((person) => (
          <PersonCard
            key={person.id}
            id={person.id}
            given_name={person.given_name}
            family_name={person.family_name}
            sex={person.sex}
          />
        ))}
      </Grid>

      {personList.length === 0 && (
        <Text color="gray" mt="4">Aucun résultat pour « {q} ».</Text>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} q={q} />
      )}
    </Container>
  );
}

function SearchForm({ defaultValue }: Readonly<{ defaultValue: string }>) {
  return (
    <form method="get">
      <Flex gap="2" maxWidth="400px">
        <TextField.Root
          name="q"
          defaultValue={defaultValue}
          placeholder="Rechercher par nom ou prénom…"
          style={{ flexGrow: 1 }}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>
      </Flex>
    </form>
  );
}

function Pagination(
  { page, totalPages, q }: Readonly<{ page: number; totalPages: number; q: string }>
) {
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const buildHref = (p: number) => `/persons?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <Flex gap="3" justify="center" mt="6">
      {prev !== null ? (
        <Link href={buildHref(prev)}>← Précédent</Link>
      ) : (
        <Text color="gray">← Précédent</Text>
      )}
      <Text>Page {page} / {totalPages}</Text>
      {next !== null ? (
        <Link href={buildHref(next)}>Suivant →</Link>
      ) : (
        <Text color="gray">Suivant →</Text>
      )}
    </Flex>
  );
}
