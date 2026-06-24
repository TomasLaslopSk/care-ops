import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
});
