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
  mutate: UseMutateFunction<
    unknown,
    unknown,
    FederatedSearchVariables,
    unknown
  >;
};


//FederatedDataTable


export interface FederatedDataTableProps {
  isLoading: boolean;
  isError: boolean;
  data: DataItem[];
  onSearch: () => void;
}