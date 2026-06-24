import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { VisitsResponse } from "../types";
import queryKeys from "../queryKeys";

// Loads visits from care-api. `limit` caps rows (600 total available).
const useGetVisits = (limit = 200) =>
  useQuery<VisitsResponse, Error>({
    queryKey: [queryKeys.getVisits, limit],
    queryFn: async () => {
      const { data } = await api.get<VisitsResponse>(`/visits?limit=${limit}`);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 60000,
    retry: 0,
  });

export default useGetVisits;
