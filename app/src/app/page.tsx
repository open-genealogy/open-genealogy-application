import { Box, Container, Flex, Heading, Text, Button, Section, Card, Grid } from "@radix-ui/themes";
import {
  PersonIcon,
  GlobeIcon,
  LockOpen1Icon,
  Share2Icon,
} from "@radix-ui/react-icons";
import Link from "next/link";

export default function LandingPage() {
  return (
    <Box>
      <HeroSection />
      <FeaturesSection />
      <CallToActionSection />
    </Box>
  );
}

function HeroSection() {
  return (
    <Section size="3" style={{ background: "var(--indigo-2)" }}>
      <Container size="3" px="4">
        <Flex
          direction="column"
          align="center"
          gap="5"
          style={{ textAlign: "center", paddingTop: "4rem", paddingBottom: "4rem" }}
        >
          <Heading size="9" style={{ color: "var(--indigo-11)", lineHeight: 1.1 }}>
            OpenGenealogy
          </Heading>
          <Text size="6" color="gray" style={{ maxWidth: "640px" }}>
            Le <strong>OpenStreetMap de la généalogie</strong> — une base de données
            généalogique libre, collaborative et ouverte à tous.
          </Text>
          <Text size="4" color="gray" style={{ maxWidth: "560px" }}>
            Comme OpenStreetMap a révolutionné la cartographie en permettant à chacun
            de contribuer à une carte du monde libre, OpenGenealogy ambitionne de faire
            la même chose pour les arbres généalogiques de l'humanité.
          </Text>
          <Flex gap="3" justify="center" wrap="wrap">
            <Button size="4" asChild>
              <Link href="/persons">Découvrez les premières personnes →</Link>
            </Button>
            <Button size="4" variant="outline" asChild>
              <Link href="/map">Carte des origines →</Link>
            </Button>
          </Flex>
        </Flex>
      </Container>
    </Section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <GlobeIcon width="28" height="28" />,
      title: "Libre et ouvert",
      description:
        "Toutes les données sont accessibles librement. Aucune barrière, aucun abonnement. La généalogie appartient à tout le monde.",
    },
    {
      icon: <Share2Icon width="28" height="28" />,
      title: "Collaboratif",
      description:
        "Chaque personne peut contribuer, enrichir et corriger les informations. Ensemble, nous construisons la mémoire collective de l'humanité.",
    },
    {
      icon: <PersonIcon width="28" height="28" />,
      title: "Centré sur les personnes",
      description:
        "Des individus, leurs événements de vie, leurs liens familiaux — une représentation fidèle et respectueuse de chaque histoire.",
    },
    {
      icon: <LockOpen1Icon width="28" height="28" />,
      title: "Données ouvertes",
      description:
        "Compatibilité avec les standards généalogiques (GEDCOM) pour importer et exporter librement vos arbres familiaux.",
    },
  ];

  return (
    <Section size="3">
      <Container size="3" px="4">
        <Heading size="6" mb="2" align="center">
          Pourquoi OpenGenealogy ?
        </Heading>
        <Text size="3" color="gray" align="center" mb="6" style={{ display: "block" }}>
          La généalogie collaborative, comme vous ne l'avez jamais vue.
        </Text>
        <Grid columns={{ initial: "1", sm: "2" }} gap="4">
          {features.map((feature) => (
            <Card key={feature.title} size="2">
              <Flex gap="3" align="start">
                <Box style={{ color: "var(--indigo-9)", flexShrink: 0, paddingTop: "2px" }}>
                  {feature.icon}
                </Box>
                <Flex direction="column" gap="1">
                  <Text size="4" weight="bold">
                    {feature.title}
                  </Text>
                  <Text size="2" color="gray">
                    {feature.description}
                  </Text>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

function CallToActionSection() {
  return (
    <Section size="3" style={{ background: "var(--indigo-9)" }}>
      <Container size="3" px="4">
        <Flex
          direction="column"
          align="center"
          gap="4"
          style={{ textAlign: "center", paddingTop: "2rem", paddingBottom: "2rem" }}
        >
          <Heading size="7" style={{ color: "white" }}>
            Prêt à explorer ?
          </Heading>
          <Text size="4" style={{ color: "var(--indigo-3)", maxWidth: "480px" }}>
            Parcourez dès maintenant les premières personnes indexées dans OpenGenealogy
            et contribuez à cette aventure collective.
          </Text>
          <Button
            size="4"
            variant="solid"
            style={{ background: "white", color: "var(--indigo-11)" }}
            asChild
          >
            <Link href="/persons">Découvrez les premières personnes →</Link>
          </Button>
        </Flex>
      </Container>
    </Section>
  );
}
