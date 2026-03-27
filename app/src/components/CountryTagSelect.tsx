"use client";

import { useReducer } from "react";
import { Popover, Badge, Button, Flex, Box, Text, CheckboxGroup } from "@radix-ui/themes";
import { Cross2Icon, ChevronDownIcon } from "@radix-ui/react-icons";
import { reducer } from "./CountryTagSelect.reducer";

export function CountryTagSelect({
  availableCountries,
  defaultSelected,
  countryNames,
}: Readonly<{
  availableCountries: string[];
  defaultSelected: string[];
  countryNames: Record<string, string>;
}>) {
  const [state, dispatch] = useReducer(reducer, { selected: defaultSelected });

  return (
    <Box>
      {state.selected.map((code) => (
        <input key={code} type="hidden" name="country" value={code} />
      ))}

      <Flex gap="2" wrap="wrap" align="center">
        {state.selected.map((code) => (
          <Badge key={code} color="indigo" variant="soft" size="2" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            {countryNames[code] ?? code}
            <button
              type="button"
              aria-label={`Supprimer ${countryNames[code] ?? code}`}
              onClick={() => dispatch({ type: "REMOVE", country: code })}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "inherit" }}
            >
              <Cross2Icon width={12} height={12} />
            </button>
          </Badge>
        ))}

        <Popover.Root>
          <Popover.Trigger>
            <Button type="button" variant="outline" size="2">
              Sélectionner des pays <ChevronDownIcon />
            </Button>
          </Popover.Trigger>
          <Popover.Content maxHeight="300px" style={{ overflowY: "auto" }}>
            <Text size="2" weight="bold" mb="3" style={{ display: "block" }}>
              Pays disponibles
            </Text>
            <CheckboxGroup.Root
              value={state.selected}
              onValueChange={(selected) => dispatch({ type: "SET", selected })}
            >
              <Flex direction="column" gap="2">
                {availableCountries.map((code) => (
                  <CheckboxGroup.Item key={code} value={code}>
                    {countryNames[code] ?? code}
                  </CheckboxGroup.Item>
                ))}
              </Flex>
            </CheckboxGroup.Root>
          </Popover.Content>
        </Popover.Root>
      </Flex>
    </Box>
  );
}
