import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { UsersResponse } from "../types";
import queryKeys from "../queryKeys";

// Staff accounts (admin only). Passwords are never returned by the API.
const useGetUsers = () =>
  useQuery<UsersResponse, Error>({
    queryKey: [queryKeys.getUsers],
    queryFn: async () => (await api.get<UsersResponse>("/users")).data,
    staleTime: 60000,
    retry: 0,
  });

export default useGetUsers;
