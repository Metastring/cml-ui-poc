import { create } from "zustand";

type FederatedSearchState = {
  query: string;
  setQuery: (query: string) => void;
};

const handleQueryChange = (
  set: (partial: Partial<FederatedSearchState>) => void,
  query: string
) => {
  set({ query: query.trim() });
};

export const useFederatedSearchStore = create<FederatedSearchState>((set) => ({
  query: "",
  setQuery: (query: string) => handleQueryChange(set, query),
}));
