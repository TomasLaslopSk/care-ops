import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { ClientsResponse } from "../types";
import queryKeys from "../queryKeys";

// Clients (operator only). The people receiving care.
const useGetClients = () =>
  useQuery<ClientsResponse, Error>({
    queryKey: [queryKeys.getClients],
    queryFn: async () => (await api.get<ClientsResponse>("/clients")).data,
    staleTime: 300000,
    retry: 0,
  });

export default useGetClients;
