import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

// Auth state persisted to localStorage so a refresh keeps you logged in.
// The axios interceptor (lib/axios.ts) reads the token from here.
interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "care-auth" },
  ),
);

export default useAuthStore;
