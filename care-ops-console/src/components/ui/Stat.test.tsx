import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Stat from "./Stat";

describe("Stat", () => {
  it("renders label and value", () => {
    render(<Stat label="Active carers" value={24} />);
    expect(screen.getByText("Active carers")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
  });

  it("renders the optional hint when provided", () => {
    render(<Stat label="Today's visits" value={39} hint="Scheduled today" />);
    expect(screen.getByText("Scheduled today")).toBeInTheDocument();
  });

  it("omits the hint when not provided", () => {
    render(<Stat label="Live alerts" value={0} />);
    expect(screen.queryByText("Scheduled today")).not.toBeInTheDocument();
  });
});
