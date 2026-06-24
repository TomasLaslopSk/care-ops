import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Message, MessagesResponse } from "../types";
import useAuthStore from "../store/useAuthStore";
import queryKeys from "../queryKeys";

// Real-time chat over SSE. Opens one EventSource to /api/events (token in the query
// string, since EventSource can't set headers) and, on each "message" event for the
// active channel, patches the messages query cache (deduped). No polling.
export default function useChatStream(channelId: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!channelId) return;
    const token = useAuthStore.getState().token;
    if (!token) return;

    const es = new EventSource(`/api/events?token=${encodeURIComponent(token)}`);

    const onMessage = (e: MessageEvent) => {
      const msg = JSON.parse(e.data) as Message;
      if (msg.channelId !== channelId) return;
      qc.setQueryData<MessagesResponse>([queryKeys.getMessages, channelId], (prev) => {
        if (!prev) return { data: [msg], total: 1 };
        if (prev.data.some((m) => m.id === msg.id)) return prev; // dedupe
        return { data: [...prev.data, msg], total: prev.total + 1 };
      });
    };

    es.addEventListener("message", onMessage);
    return () => {
      es.removeEventListener("message", onMessage);
      es.close();
    };
  }, [qc, channelId]);
}
