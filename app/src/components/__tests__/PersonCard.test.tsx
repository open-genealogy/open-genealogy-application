import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PersonCard } from "../PersonCard";

describe("PersonCard", () => {
  it("renders full name", () => {
    render(<PersonCard id="1I" given_name="Marie" family_name="DUPONT" sex="F" />);
    expect(screen.getByText("Marie DUPONT")).toBeTruthy();
  });

  it("renders sex symbol for female", () => {
    render(<PersonCard id="1I" given_name="Marie" family_name="DUPONT" sex="F" />);
    expect(screen.getByText("♀")).toBeTruthy();
  });

  it("renders sex symbol for male", () => {
    render(<PersonCard id="2I" given_name="Jean" family_name="DUPONT" sex="M" />);
    expect(screen.getByText("♂")).toBeTruthy();
  });

  it("renders 'Inconnu' when name is missing", () => {
    render(<PersonCard id="3I" given_name={null} family_name={null} />);
    expect(screen.getByText("Inconnu")).toBeTruthy();
  });

  it("links to correct person page", () => {
    render(<PersonCard id="1I" given_name="Marie" family_name="DUPONT" />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/persons/1I");
  });
});
