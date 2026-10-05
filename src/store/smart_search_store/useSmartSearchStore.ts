import { create } from "zustand";

interface SmartSearchState {
  isSmartSearch: boolean;
  setIsSmartSearch: (value: boolean) => void;
  toggleSmartSearch: () => void;
}

export const useSmartSearchStore = create<SmartSearchState>((set) => ({
  isSmartSearch: false,
  setIsSmartSearch: (value) => set({ isSmartSearch: value }),
  toggleSmartSearch: () =>
    set((state) => ({ isSmartSearch: !state.isSmartSearch })),
}));
