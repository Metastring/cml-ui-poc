import { create } from "zustand";

type FederatedSearchState = {
  query: string;
  categories: string[];   // now array of strings
  datasets: string[];
  indicators: string[];

  setQuery: (query: string) => void;
  setCategories: (categories: string[]) => void;
  setDatasets: (datasets: string[]) => void;
  setIndicators: (indicators: string[]) => void;
};

export const useFederatedSearchStore = create<FederatedSearchState>((set) => ({
  query: "",
  categories: [""],   // initialized with [""]
  datasets: [],
  indicators: [],

  setQuery: (query: string) => {
    set({ query: query.trim() });
  },

  setCategories: (categories: string[]) => {
    const clean = categories.map((c) => c.trim()).filter(Boolean);
    set({ categories: Array.from(new Set(clean)) });
  },

  setDatasets: (datasets: string[]) => {
    const clean = datasets.map((d) => d.trim()).filter(Boolean);
    set({ datasets: Array.from(new Set(clean)) });
  },

  setIndicators: (indicators: string[]) => {
    const clean = indicators.map((i) => i.trim()).filter(Boolean);
    set({ indicators: Array.from(new Set(clean)) });
  },
}));
