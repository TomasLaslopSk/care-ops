import { describe, it, expect, beforeEach } from "vitest";
import useAuthStore from "./useAuthStore";
import type { User } from "../types";

const user: User = {
  id: "U-OP1",
  name: "Olivia Operator",
  email: "operator@care.test",
  role: "operator",
};

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("starts logged out", () => {
    const { token, user: u } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(u).toBeNull();
  });

  it("setAuth stores the token and user", () => {
    useAuthStore.getState().setAuth("tok-123", user);
    const state = useAuthStore.getState();
    expect(state.token).toBe("tok-123");
    expect(state.user?.email).toBe("operator@care.test");
  });

  it("logout clears the token and user", () => {
    useAuthStore.getState().setAuth("tok-123", user);
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });
});
