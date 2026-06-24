import { useEffect, useState } from "react";
import type { Alert } from "../types";
import useAuthStore from "../store/useAuthStore";

// Live operational alerts over SSE (the care-api /api/events "alert" stream).
// Accumulates the most recent alerts received this session.
export default function useAlertStream(max = 20) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    const es = new EventSource(`/api/events?token=${encodeURIComponent(token)}`);
    const onAlert = (e: MessageEvent) => {
      const a = JSON.parse(e.data) as Alert;
      setAlerts((prev) => [a, ...prev].slice(0, max));
    };
    es.addEventListener("alert", onAlert);
    return () => {
      es.removeEventListener("alert", onAlert);
      es.close();
    };
  }, [max]);

  return alerts;
}
