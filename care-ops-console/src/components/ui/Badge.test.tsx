import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Badge from "./Badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge tone="success">On time</Badge>);
    expect(screen.getByText("On time")).toBeInTheDocument();
  });

  it("applies the tone classes", () => {
    render(<Badge tone="danger">Missed</Badge>);
    expect(screen.getByText("Missed").className).toContain("text-danger");
  });
});
