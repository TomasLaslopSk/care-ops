import { createTheme } from "@mui/material/styles";

// Mirrors the idea of @ceracare/dcp-ui's createCeraUiTheme: a single MUI theme that
// is the source of truth for colors/shape/typography. Components read from it via
// the `sx` prop or `theme.palette.*` — not hard-coded hex values.
//
// Same palette as the Tailwind track (care-ops-console) so the two look alike;
// here it lives in a JS theme object instead of CSS @theme tokens.
export const ceraTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0b0f17", paper: "#121a28" },
    primary: { main: "#7c5cff" },
    secondary: { main: "#8b5cf6" },
    success: { main: "#2ec27e" },
    warning: { main: "#f5a524" },
    error: { main: "#f4496d" },
    text: { primary: "#e7eef9", secondary: "#8aa0bd" },
    divider: "#243044",
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none", border: "1px solid #243044" },
      },
    },
  },
});
