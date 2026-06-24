import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ceraTheme } from "./theme/ceraTheme";
import App from "./App";

// Provider stack mirrors micro-fes apps/*/src/index.tsx:
//   BrowserRouter → QueryClientProvider → (axios) → ThemeProvider + CssBaseline → App
// (In micro-fes axios is its own AxiosProvider; here the instance lives in lib/axios.ts.)
const queryClient = new QueryClient();

// MSW is kept in src/mocks for reference, but we now hit the real shared
// care-api backend (via the Vite /api proxy). Flip this to true to mock instead.
const USE_MOCKS = false;

async function bootstrap() {
  if (import.meta.env.DEV && USE_MOCKS) {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={ceraTheme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>,
  );
}

bootstrap();
