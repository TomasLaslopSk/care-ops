import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Vitest + Testing Library (jsdom). Tests live next to the code they cover.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    // e2e/ holds Playwright specs — they must not run under Vitest.
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
  },
});
