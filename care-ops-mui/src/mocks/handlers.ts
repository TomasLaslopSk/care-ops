import { http, HttpResponse } from "msw";
import { carers } from "./data/carers";

// Mirrors packages/mocks/src/handlers.ts — request handlers that stand in for the
// real backend. The component/hook code is identical whether MSW or a real API answers.
export const handlers = [
  http.get("/api/carers", ({ request }) => {
    const url = new URL(request.url);
    const region = url.searchParams.get("region") ?? "";
    const status = url.searchParams.get("status") ?? "";

    let result = carers;
    if (region) result = result.filter((c) => c.region === region);
    if (status) result = result.filter((c) => c.status === status);

    return HttpResponse.json({ data: result, total: result.length });
  }),
];
