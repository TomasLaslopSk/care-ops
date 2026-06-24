import { useState, type FormEvent } from "react";
import useAuthStore from "../store/useAuthStore";
import useGetChannels from "../hooks/useGetChannels";
import useGetMessages from "../hooks/useGetMessages";
import useChatStream from "../hooks/useChatStream";
import usePostMessage from "../hooks/usePostMessage";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function Chat() {
  const user = useAuthStore((s) => s.user)!;
  const isOperator = user.role === "operator";

  // Operator picks a channel; carer/relative are fixed to their own.
  const { data: channels } = useGetChannels();
  const ownChannel = user.carerId ?? ""; // only operators use web chat; carer channel = carerId
  const [picked, setPicked] = useState("");
  const channelId = isOperator ? picked || channels?.data[0]?.id || "" : ownChannel;

  const { data, isLoading } = useGetMessages(channelId);
  useChatStream(channelId);
  const post = usePostMessage(channelId);
  const [text, setText] = useState("");

  const send = (e: FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    post.mutate(body);
    setText("");
  };

  const messages = data?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Chat</h1>
      <p className="text-muted text-sm mb-6">
        {isOperator ? "Operator view — pick any carer's channel." : "Your ops channel (live over SSE)."}
      </p>

      {isOperator && (
        <select
          value={channelId}
          onChange={(e) => setPicked(e.target.value)}
          className="mb-4 h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm text-text focus:outline-none focus:border-primary"
        >
          {channels?.data.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.id})
            </option>
          ))}
        </select>
      )}

      <Card className="p-0 flex flex-col">
        <div className="flex-1 overflow-auto p-4 space-y-3 max-h-[60vh]">
          {isLoading ? (
            <p className="text-muted text-sm">Loading…</p>
          ) : messages.length === 0 ? (
            <p className="text-muted text-sm">No messages yet.</p>
          ) : (
            messages.map((m) => (
              <div key={m.id}>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm">{m.author}</span>
                  <span className="text-xs text-muted">{time(m.createdAt)}</span>
                </div>
                <p className="text-sm text-text">{m.body}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message this channel…"
            className="flex-1 h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm text-text focus:outline-none focus:border-primary"
          />
          <Button type="submit" disabled={!text.trim() || post.isPending}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
