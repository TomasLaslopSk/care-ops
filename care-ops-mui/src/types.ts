import type { components } from "./lib/api-types";

// Domain types now FLOW FROM the server contract (openapi.yaml -> api-types.ts).
// Regenerate with: npm run gen:api
export type Carer = components["schemas"]["Carer"];
export type CarerStatus = components["schemas"]["CarerStatus"];
export type CarersResponse = components["schemas"]["CarersResponse"];

export type Visit = components["schemas"]["Visit"];
export type VisitStatus = components["schemas"]["VisitStatus"];
export type VisitsResponse = components["schemas"]["VisitsResponse"];

export type Message = components["schemas"]["Message"];
export type MessagesResponse = components["schemas"]["MessagesResponse"];
export type Alert = components["schemas"]["Alert"];

export type User = components["schemas"]["User"];
export type Role = components["schemas"]["Role"];
export type Channel = components["schemas"]["Channel"];
export type ChannelsResponse = components["schemas"]["ChannelsResponse"];
export type LoginRequest = components["schemas"]["LoginRequest"];
export type LoginResponse = components["schemas"]["LoginResponse"];
export type Client = components["schemas"]["Client"];
export type ClientsResponse = components["schemas"]["ClientsResponse"];
export type AgentRun = components["schemas"]["AgentRun"];
export type AgentRunsResponse = components["schemas"]["AgentRunsResponse"];

// Region list is a runtime value (used to render dropdowns), so it stays here.
export const REGIONS = ["North", "South", "East", "West", "Central"] as const;
export type Region = (typeof REGIONS)[number];
