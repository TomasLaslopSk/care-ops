import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:3001" }, // mock Node server
  },
  // `vite preview` (used by Playwright e2e) needs its own proxy to reach care-api.
  preview: {
    port: 4173,
    proxy: { "/api": "http://localhost:3001" },
  },
});
