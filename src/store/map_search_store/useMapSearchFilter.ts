import { create } from "zustand";

interface MapSearchFilterState {
  categories: string[];
  datasets: string[];
  indicators: string[];

  setCategories: (categories: string[]) => void;
  setDatasets: (datasets: string[]) => void;
  setIndicators: (indicators: string[]) => void;
  resetFilters: () => void;
}

const useMapSearchFilter = create<MapSearchFilterState>((set) => ({
  categories: [],
  datasets: [],
  indicators: [],

  setCategories: (categories) => {
    const clean = categories.map((c) => c.trim()).filter(Boolean);
    set({ categories: Array.from(new Set(clean)) });
  },

  setDatasets: (datasets) => {
    const clean = datasets.map((d) => d.trim()).filter(Boolean);
    set({ datasets: Array.from(new Set(clean)) });
  },

  setIndicators: (indicators) => {
    const clean = indicators.map((i) => i.trim()).filter(Boolean);
    set({ indicators: Array.from(new Set(clean)) });
  },

  resetFilters: () => set({ categories: [], datasets: [], indicators: [] }),
}));

export default useMapSearchFilter;
