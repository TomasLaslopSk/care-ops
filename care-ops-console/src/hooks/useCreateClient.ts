import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { Client, NewClientRequest } from "../types";
import queryKeys from "../queryKeys";

// Create a client (operator/admin only). On success, refetch the clients list.
export default function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: NewClientRequest) => (await api.post<Client>("/clients", body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKeys.getClients] }),
  });
}
