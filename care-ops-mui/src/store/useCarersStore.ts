import { create } from "zustand";
import type { CarerStatus } from "../types";

// Mirrors micro-fes store/useDocumentsStore.ts — local UI state (filters) in zustand.
// Server data stays in React Query; only the filter selections live here.
export interface CarersState {
  region: string;
  status: CarerStatus | "";
  setRegion: (region: string) => void;
  setStatus: (status: CarerStatus | "") => void;
  clear: () => void;
}

const useCarersStore = create<CarersState>((set) => ({
  region: "",
  status: "",
  setRegion: (region) => set({ region }),
  setStatus: (status) => set({ status }),
  clear: () => set({ region: "", status: "" }),
}));

export default useCarersStore;
