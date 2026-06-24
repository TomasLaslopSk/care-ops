import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { makeWrapper } from "../test/utils";
import useGetVisits from "./useGetVisits";

describe("useGetVisits (integration, MSW)", () => {
  it("returns the mocked visits", async () => {
    const { result } = renderHook(() => useGetVisits(200), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total).toBe(2);
    expect(result.current.data?.data.map((v) => v.id)).toContain("V-1");
  });

  it("filters by status when one is passed", async () => {
    const { result } = renderHook(() => useGetVisits(200, "completed"), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].status).toBe("completed");
  });
});
