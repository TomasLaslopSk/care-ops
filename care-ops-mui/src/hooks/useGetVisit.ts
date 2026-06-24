import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { Visit } from "../types";

// A single visit (incl. the carer's report + check-in/out times). Operator can open any.
const useGetVisit = (id: string) =>
  useQuery<Visit, Error>({
    queryKey: ["get-visit", id],
    enabled: !!id,
    queryFn: async () => (await api.get<Visit>(`/visits/${id}`)).data,
    retry: 0,
  });

export default useGetVisit;
