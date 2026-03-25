import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventList } from "../EventList";
import type { PersonEvent } from "@/db/queries/events";

const mockEvents: PersonEvent[] = [
  { id: "evt_1", kind: "birt", date_text: "14 MAR 1842", place: "Lille,59,Nord,,FRANCE,", sources: [] },
  { id: "evt_2", kind: "deat", date_text: "5 JUN 1910", place: "Paris,75,Seine,,FRANCE,", sources: [] },
];

describe("EventList", () => {
  it("renders event labels in French", () => {
    render(<EventList events={mockEvents} />);
    expect(screen.getByText("Naissance")).toBeTruthy();
    expect(screen.getByText("Décès")).toBeTruthy();
  });

  it("renders date text", () => {
    render(<EventList events={mockEvents} />);
    expect(screen.getByText("14 MAR 1842")).toBeTruthy();
  });

  it("formats place by removing empty segments", () => {
    render(<EventList events={mockEvents} />);
    expect(screen.getByText("Lille, 59, Nord, FRANCE")).toBeTruthy();
  });

  it("renders empty state when no events", () => {
    render(<EventList events={[]} />);
    expect(screen.getByText("Aucun événement enregistré.")).toBeTruthy();
  });
});
