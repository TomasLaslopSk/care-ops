import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { Visit } from "../types";
import queryKeys from "../queryKeys";

// Assign / reassign a visit to a carer (operator only). On success, refetch visits.
export default function useAssignVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ visitId, carerId }: { visitId: string; carerId: string }) => {
      const { data } = await api.patch<Visit>(`/visits/${visitId}`, { carerId });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKeys.getVisits] }),
  });
}
