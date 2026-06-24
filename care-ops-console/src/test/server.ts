import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// MSW node server used by integration tests. Lifecycle is wired in setupTests.ts.
export const server = setupServer(...handlers);
