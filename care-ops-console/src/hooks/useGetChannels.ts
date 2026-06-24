import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { ChannelsResponse } from "../types";

// Chat channels visible to the current user. Operator -> all carers;
// carer/relative -> just their own channel.
const useGetChannels = () =>
  useQuery<ChannelsResponse, Error>({
    queryKey: ["get-channels"],
    queryFn: async () => {
      const { data } = await api.get<ChannelsResponse>("/channels");
      return data;
    },
    staleTime: 300000,
    retry: 0,
  });

export default useGetChannels;
