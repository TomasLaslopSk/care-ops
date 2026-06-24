import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../test/server";
import { makeWrapper } from "../test/utils";
import useGetCarers from "./useGetCarers";

describe("useGetCarers (integration, MSW)", () => {
  it("returns the mocked carers", async () => {
    const { result } = renderHook(() => useGetCarers("", ""), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total).toBe(3);
    expect(result.current.data?.data[0].name).toBe("Amara Okoro");
  });

  it("forwards the region/status filters to the request", async () => {
    let requestedUrl = "";
    server.use(
      http.get("*/api/carers", ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json({ data: [], total: 0 });
      }),
    );
    const { result } = renderHook(() => useGetCarers("North", "active"), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestedUrl).toContain("region=North");
    expect(requestedUrl).toContain("status=active");
  });
});
