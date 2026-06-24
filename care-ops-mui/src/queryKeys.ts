// Mirrors micro-fes apps/*/src/queryKeys.ts — central enum of React Query keys,
// so cache keys are never stringly-typed and typos can't silently break caching.
enum QueryKeys {
  getCarers = "get-carers",
  getVisits = "get-visits",
  getMessages = "get-messages",
  getClients = "get-clients",
}

export default QueryKeys;
