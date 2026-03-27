import type { PersonRow } from "@/db/queries/map";

export type State = {
  selectedCountryCode: string | null;
  selectedCountryName: string | null;
  persons: PersonRow[];
  loading: boolean;
};

export type Action =
  | { type: "SELECT"; code: string; name: string }
  | { type: "LOADED"; persons: PersonRow[] }
  | { type: "CLEAR" };

export const initialState: State = {
  selectedCountryCode: null,
  selectedCountryName: null,
  persons: [],
  loading: false,
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT":
      return {
        ...state,
        selectedCountryCode: action.code,
        selectedCountryName: action.name,
        persons: [],
        loading: true,
      };
    case "LOADED":
      return { ...state, persons: action.persons, loading: false };
    case "CLEAR":
      return initialState;
  }
}
