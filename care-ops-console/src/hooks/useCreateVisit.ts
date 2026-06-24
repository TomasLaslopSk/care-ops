import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { Visit } from "../types";
import queryKeys from "../queryKeys";

export interface NewVisit {
  clientId: string;
  carerId: string;
  scheduledAt: string;
  durationMin: number;
  tasks?: string[];
}

// Create a visit (operator only). On success, refetch the visits list.
export default function useCreateVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: NewVisit) => (await api.post<Visit>("/visits", body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKeys.getVisits] }),
  });
}
