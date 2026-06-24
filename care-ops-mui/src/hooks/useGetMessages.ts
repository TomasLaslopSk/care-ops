import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { MessagesResponse } from "../types";
import queryKeys from "../queryKeys";

// Loads chat messages for a channel. Live updates arrive via SSE (useChatStream),
// which patches this same query's cache. `enabled` lets us wait until we know the channel.
const useGetMessages = (channelId: string) =>
  useQuery<MessagesResponse, Error>({
    queryKey: [queryKeys.getMessages, channelId],
    enabled: !!channelId,
    queryFn: async () => {
      const { data } = await api.get<MessagesResponse>(`/messages?channelId=${channelId}`);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 60000,
    retry: 0,
  });

export default useGetMessages;
