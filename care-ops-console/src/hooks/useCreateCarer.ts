import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { Carer, NewCarerRequest } from "../types";
import queryKeys from "../queryKeys";

// Create a carer (operator/admin only). On success, refetch the carers roster.
export default function useCreateCarer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: NewCarerRequest) => (await api.post<Carer>("/carers", body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKeys.getCarers] }),
  });
}
