import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import Layout from "./components/Layout";
import Login from "./components/Login";
import useAuthStore from "./store/useAuthStore";
import Dashboard from "./routes/Dashboard";
import Visits from "./routes/Visits";
import Carers from "./routes/Carers";
import Clients from "./routes/Clients";
import Chat from "./routes/Chat";
import VisitDetail from "./routes/VisitDetail";
import Scheduling from "./routes/Scheduling";
import AgentRuns from "./routes/AgentRuns";

const rootRoute = createRootRoute({
  // Auth gate: no user -> Login (no shell). Otherwise the app shell + current route.
  component: () => {
    const user = useAuthStore((s) => s.user);
    if (!user) return <Login />;
    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  },
});

const dashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: Dashboard });
const visitsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/visits", component: Visits });
const visitDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: "/visits/$visitId", component: VisitDetail });
const carersRoute = createRoute({ getParentRoute: () => rootRoute, path: "/carers", component: Carers });
const clientsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/clients", component: Clients });
const schedulingRoute = createRoute({ getParentRoute: () => rootRoute, path: "/scheduling", component: Scheduling });
const chatRoute = createRoute({ getParentRoute: () => rootRoute, path: "/chat", component: Chat });
const agentRunsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/agent-runs", component: AgentRuns });

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  visitsRoute,
  visitDetailRoute,
  carersRoute,
  clientsRoute,
  schedulingRoute,
  chatRoute,
  agentRunsRoute,
]);

export const router = createRouter({ routeTree });

// Whole-app type safety for the router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
