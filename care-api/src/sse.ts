import type { Response } from "express";
import type { User } from "./data.ts";
import { canSeeChannel } from "./auth.ts";

// SSE hub: tracks connected clients (with their user) and pushes events.
// SSE = one long-lived HTTP response; we write "event:"/"data:" frames over time.
const clients = new Map<Response, User | undefined>();

export function addClient(res: Response, user: User | undefined) {
  clients.set(res, user);
  res.on("close", () => clients.delete(res));
}

export function send(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// Broadcast a chat message only to clients allowed to see its channel.
export function broadcastMessage(channelId: string, data: unknown) {
  for (const [res, user] of clients) {
    if (user && canSeeChannel(user, channelId)) send(res, "message", data);
  }
}

// Broadcast an operational alert to everyone connected.
export function broadcastAlert(data: unknown) {
  for (const res of clients.keys()) send(res, "alert", data);
}

export const clientCount = () => clients.size;
