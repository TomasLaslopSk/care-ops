import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { CarersResponse, CarerStatus } from "../types";
import queryKeys from "../queryKeys";

// Identical to care-ops-mui's hook: useQuery + axios + typed response +
// a query key that includes the filters (so changing a filter refetches/caches).
const useGetCarers = (region: string, status: CarerStatus | "") =>
  useQuery<CarersResponse, Error>({
    queryKey: [queryKeys.getCarers, region, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (region) params.set("region", region);
      if (status) params.set("status", status);
      const { data } = await api.get<CarersResponse>(`/carers?${params.toString()}`);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 60000,
    retry: 0,
  });

export default useGetCarers;
