//FederatedSearchBar

import { UseMutateFunction } from "@tanstack/react-query";
import { DataItem } from "../api/federatedSearch.types";

export interface Option {
  value: string;
  label: string;
}

export type FederatedSearchVariables = {
  search_text: string;
  category: string[];
  dataset: string[];
  fields: string[];
};

export type FederatedSearchBarProps = {
  mutate?: UseMutateFunction<
    unknown,
    unknown,
    FederatedSearchVariables,
    unknown
  >;
};


//FederatedDataTable

/** Human-readable label for a field key (e.g. vernacular_name_common_names → Vernacular Name (Common Names)) */
export function fieldLabel(fieldKey: string): string {
  if (fieldKey === "vernacular_name_common_names") {
    return "Vernacular Name (Common Names)";
  }
  return fieldKey
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export interface FederatedDataTableProps {
  isLoading: boolean;
  isError: boolean;
  data: DataItem[];
  /** Ordered field names from API; columns shown between Explore on Map and Dataset */
  fieldColumns?: string[];
  /** Field name -> header label; falls back to fieldLabel() when absent */
  columnLabels?: Record<string, string>;
  /** Hides the Explore column and its row menu */
  showExploreColumn?: boolean;
  onSearch?: () => void;
  /** Tighter layout for nested views; hides dataset column */
  embedded?: boolean;
}