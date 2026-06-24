import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import useAuthStore from "../store/useAuthStore";

// MUI equivalent of care-ops-console's Layout (app shell): sidebar + topbar + content.
// Same chrome so both projects look identical in the browser.
const nav: { to: string; label: string; end: boolean; adminOnly?: boolean }[] = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/visits", label: "Visits", end: false },
  { to: "/carers", label: "Carers", end: false },
  { to: "/clients", label: "Clients", end: false },
  { to: "/scheduling", label: "Scheduling", end: false },
  { to: "/chat", label: "Chat", end: false },
  { to: "/agent-runs", label: "Agent runs", end: false, adminOnly: true },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Box
        component="aside"
        sx={{
          width: 224,
          flexShrink: 0,
          bgcolor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            px: 2,
            height: 56,
            display: "flex",
            alignItems: "center",
            fontWeight: 700,
            fontSize: "1.125rem",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          Care
          <Box component="span" sx={{ color: "secondary.main" }}>
            Ops
          </Box>
        </Box>

        <Box component="nav" sx={{ p: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {nav
            .filter((n) => !n.adminOnly || user?.role === "admin")
            .map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Box
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    fontSize: "0.875rem",
                    color: isActive ? "common.white" : "text.secondary",
                    bgcolor: isActive ? "primary.main" : "transparent",
                    "&:hover": isActive ? {} : { bgcolor: "action.hover", color: "text.primary" },
                  }}
                >
                  {n.label}
                </Box>
              )}
            </NavLink>
          ))}
        </Box>

        <Box
          sx={{
            mt: "auto",
            p: 1.5,
            fontSize: "0.75rem",
            color: "text.secondary",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          v0.1 · operator console
        </Box>
      </Box>

      {/* Main */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Box
          component="header"
          sx={{
            height: 56,
            flexShrink: 0,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Cera — Care Operations
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, fontSize: "0.875rem" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main" }} /> Live
            </Box>
            {user && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {user.name} · <Box component="span" sx={{ color: "primary.main" }}>{user.role}</Box>
                </Typography>
                <Button size="small" variant="outlined" onClick={logout}>
                  Log out
                </Button>
              </Box>
            )}
          </Box>
        </Box>
        <Box component="main" sx={{ flex: 1, overflow: "auto", p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
