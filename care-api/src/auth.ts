import type { Request, Response, NextFunction } from "express";
import { users, type User } from "./data.ts";

// Request with the resolved user attached by requireAuth.
export type AuthedRequest = Request & { user?: User };

// Simplified token = "tok-<userId>". NOT a real JWT — learning only.
export const tokenFor = (u: User) => `tok-${u.id}`;

export function userFromToken(token?: string): User | undefined {
  if (!token) return undefined;
  return users.find((u) => tokenFor(u) === token);
}

// Reads the bearer token from the Authorization header, or from ?token=
// (used by SSE, since EventSource can't set headers).
export function readToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);
  const q = req.query.token;
  return typeof q === "string" ? q : undefined;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const user = userFromToken(readToken(req));
  if (!user) return res.status(401).json({ error: "unauthorized" });
  req.user = user;
  next();
}

// Chat channel ids: a carer's channel == carerId, a client's channel == clientId.
// Operator -> any; carer -> their carer channel; relative -> their client channel.
export function canSeeChannel(user: User, channelId: string): boolean {
  if (user.role === "operator" || user.role === "admin") return true;
  if (user.role === "carer") return user.carerId === channelId;
  if (user.role === "relative") return user.relatedClientId === channelId;
  return false;
}

// The channel a non-operator writes/reads by default.
export function ownChannel(user: User): string | undefined {
  if (user.role === "carer") return user.carerId;
  if (user.role === "relative") return user.relatedClientId;
  return undefined; // operator: specify channelId
}
