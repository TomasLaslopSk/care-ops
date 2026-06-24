import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Mirrors micro-fes: Vite + React plugin. UI is MUI + Emotion (no Tailwind here).
// /api/* is proxied to the shared care-api backend (same as care-ops-console).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: { "/api": "http://localhost:3001" },
  },
});
