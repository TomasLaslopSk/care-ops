import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { StatsResponse } from "../types";
import queryKeys from "../queryKeys";

// Dashboard summary stats (operator/admin only), computed server-side by care-api
// (GET /api/stats) so the console doesn't have to fetch full lists just to count.
const useGetStats = () =>
  useQuery<StatsResponse, Error>({
    queryKey: [queryKeys.getStats],
    queryFn: async () => (await api.get<StatsResponse>("/stats")).data,
    refetchOnWindowFocus: false,
    staleTime: 60000,
    retry: 0,
  });

export default useGetStats;
