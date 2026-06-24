import { defineConfig, devices } from "@playwright/test";

// E2E runs against the REAL care-api + a production build of the console served by
// `vite preview`. Playwright boots both servers before the suite and tears them down
// after. care-api persists to data.json, so e2e mutations survive — keep specs tidy.
const PREVIEW_PORT = 4173;
const API_PORT = 3001;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PREVIEW_PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // Real backend. `start` runs tsx without watch mode.
      command: "npm --prefix ../care-api run start",
      port: API_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      // Production build, then preview it on PREVIEW_PORT.
      command: "npm run build && npm run preview",
      port: PREVIEW_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
