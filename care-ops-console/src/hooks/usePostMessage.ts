import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { Message, MessagesResponse } from "../types";
import queryKeys from "../queryKeys";

// Posts a chat message to a channel. The server also broadcasts over SSE, so on
// success we append to the cache (deduped); the SSE copy is then ignored.
export default function usePostMessage(channelId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      const { data } = await api.post<Message>("/messages", { channelId, body });
      return data;
    },
    onSuccess: (msg) => {
      qc.setQueryData<MessagesResponse>([queryKeys.getMessages, channelId], (prev) => {
        if (!prev) return { data: [msg], total: 1 };
        if (prev.data.some((m) => m.id === msg.id)) return prev;
        return { data: [...prev.data, msg], total: prev.total + 1 };
      });
    },
  });
}
