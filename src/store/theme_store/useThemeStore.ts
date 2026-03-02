import { create } from "zustand";

export const THEME_IDS = [
  "default",
  "dark",
  "observatory",
  "mountain",
  "grassland",
  "journal",
  "tropical",
  "moss",
  "ocean",
  "sunset",
  "forest",
  "emerald",
  "wetland",
  "earth",
  "bluegreen",
  "botanical",
  "conservation",
  "coral",
  "amber",
  "slate",
  "lavender",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

const STORAGE_KEY = "app-theme";

interface ThemeState {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  hydrate: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "default",
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, theme);
    }
    set({ theme });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (saved && THEME_IDS.includes(saved)) {
      set({ theme: saved });
    }
  },
}));
