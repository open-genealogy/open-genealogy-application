export type CountryTagSelectState = { selected: string[] };

export type CountryTagSelectAction =
  | { type: "SET"; selected: string[] }
  | { type: "REMOVE"; country: string };

export function reducer(
  state: CountryTagSelectState,
  action: CountryTagSelectAction,
): CountryTagSelectState {
  switch (action.type) {
    case "SET":
      return { selected: action.selected };
    case "REMOVE":
      return { selected: state.selected.filter((c) => c !== action.country) };
  }
}
