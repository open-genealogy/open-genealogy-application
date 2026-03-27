import { Box, Container, Heading, Text } from "@radix-ui/themes";
import { getPersonCountByCountry } from "@/db/queries/map";
import { EuropeMap } from "@/components/EuropeMap";

export default async function MapPage() {
  const countryCounts = await getPersonCountByCountry();
  const total = Object.values(countryCounts).reduce((s, n) => s + n, 0);

  return (
    <Container size="4" px="4" py="6">
      <Heading size="7" mb="2">
        Origines géographiques
      </Heading>
      <Text size="3" color="gray" style={{ display: "block" }} mb="6">
        {total.toLocaleString("fr-FR")} personnes réparties dans{" "}
        {Object.keys(countryCounts).length} pays. Cliquez sur un pays pour
        voir le détail.
      </Text>
      <Box>
        <EuropeMap countryCounts={countryCounts} />
      </Box>
    </Container>
  );
}
