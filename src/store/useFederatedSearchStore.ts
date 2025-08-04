import { create } from "zustand";

type FederatedSearchState = {
  query: string;
  categories: string;
  datasets: string[];
  indicators: string[];

  setQuery: (query: string) => void;
  setCategories: (category: string) => void;
  setDatasets: (datasets: string[]) => void;
  setIndicators: (indicators: string[]) => void;
};

export const useFederatedSearchStore = create<FederatedSearchState>((set) => ({
  query: "",
  categories: "",
  datasets: [],
  indicators: [],

  setQuery: (query: string) => {
    set({ query: query.trim() });
  },

  setCategories: (category: string) => {
    set({ categories: category.trim() });
  },

  setDatasets: (datasets: string[]) => {
    const clean = datasets.map((d) => d.trim()).filter(Boolean);
    set({ datasets: Array.from(new Set(clean)) });
  },
  setIndicators: (indicators: string[]) => {
    const clean = indicators.map((d) => d.trim()).filter(Boolean);
    set({ indicators: Array.from(new Set(clean)) });
  },
}));
