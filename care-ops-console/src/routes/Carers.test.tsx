import { describe, it, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { makeWrapper } from "../test/utils";
import Carers from "./Carers";

describe("Carers route (integration, MSW)", () => {
  it("renders rows fetched from the mocked API", async () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Carers />
      </Wrapper>,
    );
    // Heading is present immediately.
    expect(screen.getByRole("heading", { name: "Carers" })).toBeInTheDocument();
    // Rows arrive once the mocked request resolves.
    await waitFor(() => expect(screen.getByText("Amara Okoro")).toBeInTheDocument());
    expect(screen.getByText("Ben Carter")).toBeInTheDocument();
    expect(screen.getByText("Chloe Davis")).toBeInTheDocument();
  });

  it("creates a carer through the form and shows a success toast", async () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Carers />
      </Wrapper>,
    );
    fireEvent.change(screen.getByLabelText("Carer name"), { target: { value: "Tessa Vale" } });
    // Index 0 is the create form's Region select (Filters renders a second one).
    fireEvent.change(screen.getAllByLabelText("Region")[0], { target: { value: "North" } });
    fireEvent.click(screen.getByRole("button", { name: "Add carer" }));

    await waitFor(() =>
      expect(screen.getByText(/Carer created: Tessa Vale \(North\)/)).toBeInTheDocument(),
    );
  });
});
