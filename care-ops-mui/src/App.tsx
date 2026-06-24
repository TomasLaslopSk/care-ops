import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import useAuthStore from "./store/useAuthStore";

// Mirrors micro-fes App.tsx: lazy-loaded pages behind a Suspense fallback.
// Wrapped in the shared Layout shell (sidebar + topbar), like care-ops-console.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Visits = lazy(() => import("./pages/Visits"));
const VisitDetail = lazy(() => import("./pages/VisitDetail"));
const Carers = lazy(() => import("./pages/Carers"));
const Clients = lazy(() => import("./pages/Clients"));
const Scheduling = lazy(() => import("./pages/Scheduling"));
const Chat = lazy(() => import("./pages/Chat"));
const AgentRuns = lazy(() => import("./pages/AgentRuns"));

export default function App() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Login />; // auth gate

  return (
    <Layout>
      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
            <CircularProgress />
          </Box>
        }
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/visits" element={<Visits />} />
          <Route path="/visits/:id" element={<VisitDetail />} />
          <Route path="/carers" element={<Carers />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/agent-runs" element={<AgentRuns />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
