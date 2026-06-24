// Central map of React Query keys. (Same idea as care-ops-mui's enum, but written
// as a const object because this project's tsconfig has `erasableSyntaxOnly`, which
// disallows runtime `enum`.)
const QueryKeys = {
  getCarers: "get-carers",
  getVisits: "get-visits",
  getMessages: "get-messages",
  getClients: "get-clients",
  getStats: "get-stats",
} as const;

export default QueryKeys;
