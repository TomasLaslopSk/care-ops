import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { VisitsResponse, VisitStatus } from "../types";
import queryKeys from "../queryKeys";

// Loads visits from care-api. `limit` caps rows (600 total available); an optional
// `status` is forwarded to the API (which already supports filtering). The status is
// part of the query key so changing the filter refetches/caches correctly.
const useGetVisits = (limit = 200, status: VisitStatus | "" = "") =>
  useQuery<VisitsResponse, Error>({
    queryKey: [queryKeys.getVisits, limit, status],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (status) params.set("status", status);
      const { data } = await api.get<VisitsResponse>(`/visits?${params.toString()}`);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 60000,
    retry: 0,
  });

export default useGetVisits;
