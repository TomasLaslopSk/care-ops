import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./test/server";

// Start the MSW mock API for integration tests; reset handlers between tests so
// per-test overrides don't leak; close it when the suite finishes.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
