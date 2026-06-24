import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import useAuthStore from "../store/useAuthStore";

const nav: { to: string; label: string; adminOnly?: boolean }[] = [
  { to: "/", label: "Dashboard" },
  { to: "/visits", label: "Visits" },
  { to: "/carers", label: "Carers" },
  { to: "/clients", label: "Clients" },
  { to: "/scheduling", label: "Scheduling" },
  { to: "/chat", label: "Chat" },
  { to: "/agent-runs", label: "Agent runs", adminOnly: true },
  { to: "/administration", label: "Administration", adminOnly: true },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="px-4 h-14 flex items-center font-bold text-lg border-b border-border">
          Care<span className="text-secondary" >Ops</span>
        </div>
        <nav className="p-2 flex flex-col gap-1">
          {nav
            .filter((n) => !n.adminOnly || user?.role === "admin")
            .map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-text transition-colors [&.active]:bg-primary [&.active]:text-white"
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-3 text-xs text-muted border-t border-border">v0.1 · operator console</div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 border-b border-border bg-surface flex items-center justify-between px-4">
          <div className="text-sm text-muted">Cera — Care Operations</div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-success" /> Live
            </span>
            {user && (
              <span className="flex items-center gap-3">
                <span className="text-muted">
                  {user.name} · <span className="text-primary">{user.role}</span>
                </span>
                <button
                  onClick={logout}
                  className="text-xs px-2 py-1 rounded-lg border border-border text-muted hover:text-text hover:bg-surface-2 transition-colors"
                >
                  Log out
                </button>
              </span>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
