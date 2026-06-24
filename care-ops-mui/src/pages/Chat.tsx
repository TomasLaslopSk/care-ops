import { useState, type FormEvent } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import useAuthStore from "../store/useAuthStore";
import useGetChannels from "../hooks/useGetChannels";
import useGetMessages from "../hooks/useGetMessages";
import useChatStream from "../hooks/useChatStream";
import usePostMessage from "../hooks/usePostMessage";

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function Chat() {
  const user = useAuthStore((s) => s.user)!;
  const isOperator = user.role === "operator";

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
    <Box>
      <Typography variant="h5" fontWeight={700}>
        Chat
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {isOperator ? "Operator view — pick any carer's channel." : "Your ops channel (live over SSE)."}
      </Typography>

      {isOperator && (
        <FormControl size="small" sx={{ mb: 2, width: 280 }}>
          <InputLabel>Channel</InputLabel>
          <Select label="Channel" value={channelId} onChange={(e) => setPicked(e.target.value)}>
            {channels?.data.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name} ({c.id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Paper sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{ flex: 1, overflow: "auto", p: 2, maxHeight: "60vh", display: "flex", flexDirection: "column", gap: 1.5 }}>
          {isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading…
            </Typography>
          ) : messages.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No messages yet.
            </Typography>
          ) : (
            messages.map((m) => (
              <Box key={m.id}>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {m.author}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {time(m.createdAt)}
                  </Typography>
                </Box>
                <Typography variant="body2">{m.body}</Typography>
              </Box>
            ))
          )}
        </Box>

        <Box
          component="form"
          onSubmit={send}
          sx={{ display: "flex", gap: 1, borderTop: "1px solid", borderColor: "divider", p: 1.5 }}
        >
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message this channel…"
            size="small"
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={!text.trim() || post.isPending}>
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
