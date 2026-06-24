import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { User, NewUserRequest } from "../types";
import queryKeys from "../queryKeys";

// Create an operator or admin (admin only). On success, refetch the user list.
export default function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: NewUserRequest) => (await api.post<User>("/users", body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKeys.getUsers] }),
  });
}
