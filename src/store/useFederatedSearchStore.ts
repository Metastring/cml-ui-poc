import { create } from "zustand";

type FederatedSearchState = {
  query: string;
  categories: string[]; // ✅ now supports multiple categories
  setQuery: (query: string) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  clearCategories: () => void;
};

export const useFederatedSearchStore = create<FederatedSearchState>((set) => ({
  query: "",
  categories: [],

  setQuery: (query) => {
    set({ query: query.trim() });
  },
  
  addCategory: (category) => {
  if (!category.trim()) return;
  set((state) => ({
    categories: [...new Set([...state.categories, category.trim()])],
  }));
},

  removeCategory: (category) => {
    set((state) => ({
      categories: state.categories.filter((c) => c !== category),
    }));
  },

  clearCategories: () => {
    set({ categories: [] });
  },
}));
