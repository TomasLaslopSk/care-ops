import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { AgentRun, AgentRunsResponse } from "../types";

// Admin-only: the AI agent runs awaiting supervision (the JD "agent-supervision surface").
export function useGetAgentRuns() {
  return useQuery<AgentRunsResponse, Error>({
    queryKey: ["agent-runs"],
    queryFn: async () => (await api.get<AgentRunsResponse>("/agent-runs")).data,
    refetchInterval: 10000, // pick up new nightly runs
    retry: 0,
  });
}

export function useDecideAgentRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; decision: "approved" | "overridden"; note: string }) =>
      (await api.post<AgentRun>(`/agent-runs/${args.id}/decision`, { decision: args.decision, note: args.note })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-runs"] }),
  });
}
