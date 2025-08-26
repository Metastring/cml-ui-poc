import { create } from "zustand";

interface MapSearchFilterState {
  categories: string[];
  datasets: string[];

  setCategories: (categories: string[]) => void;
  setDatasets: (datasets: string[]) => void;
  resetFilters: () => void;
}

const useMapSearchFilter = create<MapSearchFilterState>((set) => ({
  categories: [],
  datasets: [],

  setCategories: (categories) => set({ categories }),
  setDatasets: (datasets) => set({ datasets }),
  resetFilters: () =>
    set({
      categories: [],
      datasets: [],
    }),
}));

export default useMapSearchFilter;
