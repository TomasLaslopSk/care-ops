import { describe, it, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { makeWrapper } from "../test/utils";
import Administration from "./Administration";

describe("Administration route (integration, MSW)", () => {
  it("lists staff accounts from the mocked API", async () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Administration />
      </Wrapper>,
    );
    expect(screen.getByRole("heading", { name: "Administration" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Olivia Operator")).toBeInTheDocument());
    expect(screen.getByText("Adele Admin")).toBeInTheDocument();
  });

  it("creates an operator through the form and shows a success toast", async () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Administration />
      </Wrapper>,
    );
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Nina Ops" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "nina@care.test" } });
    fireEvent.change(screen.getByLabelText("Temporary password"), { target: { value: "secret123" } });
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "operator" } });
    fireEvent.click(screen.getByRole("button", { name: "Create user" }));

    await waitFor(() =>
      expect(screen.getByText(/User created: Nina Ops \(operator\)/)).toBeInTheDocument(),
    );
  });
});
