import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Button from "./Button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("applies variant and size classes", () => {
    render(
      <Button variant="danger" size="sm">
        Delete
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Delete" });
    expect(btn.className).toContain("bg-danger");
    expect(btn.className).toContain("h-8");
  });

  it("defaults to the primary variant and md size", () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole("button", { name: "Default" });
    expect(btn.className).toContain("bg-primary");
    expect(btn.className).toContain("h-10");
  });

  it("respects the disabled attribute", () => {
    render(<Button disabled>Off</Button>);
    expect(screen.getByRole("button", { name: "Off" })).toBeDisabled();
  });
});
