import Link from "next/link";
import { Card, Text, Flex } from "@radix-ui/themes";

type Props = Readonly<{
  id: string;
  given_name: string | null;
  family_name: string | null;
  sex?: string | null;
}>;

export function PersonCard({ id, given_name, family_name, sex }: Props) {
  const fullName = [given_name, family_name].filter(Boolean).join(" ") || "Inconnu";
  const sexLabel = sex === "M" ? "♂" : sex === "F" ? "♀" : "";

  return (
    <Link href={`/persons/${id}`} style={{ textDecoration: "none" }}>
      <Card asChild>
        <div>
          <Flex gap="2" align="center">
            {sexLabel && <Text size="2" color="gray">{sexLabel}</Text>}
            <Text size="2" weight="medium">{fullName}</Text>
          </Flex>
        </div>
      </Card>
    </Link>
  );
}
