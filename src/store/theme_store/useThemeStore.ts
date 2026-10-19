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

export const TEXT_SIZE_IDS = ["small", "medium", "large"] as const;

export type TextSizeId = (typeof TEXT_SIZE_IDS)[number];

const STORAGE_KEY = "app-theme";
const TEXT_SIZE_STORAGE_KEY = "app-text-size";

interface ThemeState {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  textSize: TextSizeId;
  setTextSize: (textSize: TextSizeId) => void;
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
  textSize: "medium",
  setTextSize: (textSize) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TEXT_SIZE_STORAGE_KEY, textSize);
    }
    set({ textSize });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (saved && THEME_IDS.includes(saved)) {
      set({ theme: saved });
    }
    const savedTextSize = localStorage.getItem(TEXT_SIZE_STORAGE_KEY) as TextSizeId | null;
    if (savedTextSize && TEXT_SIZE_IDS.includes(savedTextSize)) {
      set({ textSize: savedTextSize });
    }
  },
}));
