import { http, HttpResponse } from "msw";
import type { Carer, Client, User, Visit } from "../types";

export const mockUsers: User[] = [
  { id: "U-OP1", name: "Olivia Operator", email: "operator@care.test", role: "operator" },
  { id: "U-AD1", name: "Adele Admin", email: "admin@care.test", role: "admin" },
];

// Seeded shapes that mirror care-api's contract (small subset, enough for hooks/UI).
export const mockCarers: Carer[] = [
  { id: "C-1000", name: "Amara Okoro", region: "North", status: "active", visitsThisWeek: 12 },
  { id: "C-1001", name: "Ben Carter", region: "South", status: "onboarding", visitsThisWeek: 3 },
  { id: "C-1002", name: "Chloe Davis", region: "North", status: "inactive", visitsThisWeek: 0 },
];

export const mockClients: Client[] = [
  { id: "CL-2000", name: "Mabel Reed", region: "North", lat: 51.5, lng: -0.12, address: "1 Oak St" },
  { id: "CL-2001", name: "Stanley Cole", region: "South", lat: 51.6, lng: -0.1, address: "2 Elm Rd" },
];

export const mockVisits: Visit[] = [
  {
    id: "V-1",
    clientId: "CL-2000",
    client: "Edith Stone",
    clientLat: 51.5,
    clientLng: -0.12,
    clientAddress: "1 High St",
    carerId: "C-1000",
    carerName: "Amara Okoro",
    region: "North",
    scheduledAt: new Date().toISOString(),
    durationMin: 30,
    status: "scheduled",
    tasks: [{ id: "V-1-T0", label: "Medication", done: false }],
  },
  {
    id: "V-2",
    clientId: "CL-2001",
    client: "Frank Hill",
    clientLat: 51.6,
    clientLng: -0.1,
    clientAddress: "2 Main Rd",
    carerId: "C-1001",
    carerName: "Ben Carter",
    region: "South",
    scheduledAt: new Date().toISOString(),
    durationMin: 45,
    status: "completed",
    tasks: [],
  },
];

// `*/api/...` matches whatever origin jsdom resolves the relative baseURL against.
export const handlers = [
  http.post("*/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string; app?: string };
    if (body.email === "operator@care.test" && body.password === "operator123") {
      return HttpResponse.json({
        token: "mock-token",
        user: { id: "U-OP1", name: "Olivia Operator", email: body.email, role: "operator" },
      });
    }
    return HttpResponse.json({ error: "invalid credentials" }, { status: 401 });
  }),

  http.get("*/api/carers", ({ request }) => {
    const url = new URL(request.url);
    const region = url.searchParams.get("region") ?? "";
    const status = url.searchParams.get("status") ?? "";
    let data = mockCarers;
    if (region) data = data.filter((c) => c.region === region);
    if (status) data = data.filter((c) => c.status === status);
    return HttpResponse.json({ data, total: data.length });
  }),

  http.post("*/api/carers", async ({ request }) => {
    const b = (await request.json()) as { name: string; region: string; status?: string };
    return HttpResponse.json(
      { id: "C-9001", name: b.name, region: b.region, status: b.status ?? "onboarding", visitsThisWeek: 0 },
      { status: 201 },
    );
  }),

  http.get("*/api/clients", () => HttpResponse.json({ data: mockClients, total: mockClients.length })),

  http.post("*/api/clients", async ({ request }) => {
    const b = (await request.json()) as { name: string; region: string; address?: string };
    return HttpResponse.json(
      { id: "CL-9001", name: b.name, region: b.region, lat: 51.5, lng: -0.12, address: b.address || "—" },
      { status: 201 },
    );
  }),

  http.get("*/api/users", () => HttpResponse.json({ data: mockUsers, total: mockUsers.length })),

  http.post("*/api/users", async ({ request }) => {
    const b = (await request.json()) as { name: string; email: string; role: string };
    return HttpResponse.json(
      { id: "U-9001", name: b.name, email: b.email, role: b.role },
      { status: 201 },
    );
  }),

  http.get("*/api/visits", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") ?? "";
    let data = mockVisits;
    if (status) data = data.filter((v) => v.status === status);
    return HttpResponse.json({ data, total: data.length });
  }),
];
