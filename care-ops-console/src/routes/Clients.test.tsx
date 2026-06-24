import { describe, it, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { makeWrapper } from "../test/utils";
import Clients from "./Clients";

describe("Clients route (integration, MSW)", () => {
  it("lists clients fetched from the mocked API", async () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Clients />
      </Wrapper>,
    );
    expect(screen.getByRole("heading", { name: "Clients" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Mabel Reed")).toBeInTheDocument());
    expect(screen.getByText("Stanley Cole")).toBeInTheDocument();
  });

  it("creates a client through the form and shows a success toast", async () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Clients />
      </Wrapper>,
    );
    fireEvent.change(screen.getByLabelText("Client name"), { target: { value: "Arthur Penn" } });
    fireEvent.change(screen.getByLabelText("Region"), { target: { value: "South" } });
    fireEvent.click(screen.getByRole("button", { name: "Add client" }));

    await waitFor(() =>
      expect(screen.getByText(/Client created: Arthur Penn \(South\)/)).toBeInTheDocument(),
    );
  });
});
