// src/types/app/mapSearch.types.ts

import { FederatedSearchDataItem } from "@/types/api/mapSearch.types";

export type DataItem = FederatedSearchDataItem;

export interface MapSearchDataTableProps {
  isLoading: boolean;
  isError: boolean;
  // optionally include data if needed
  // data?: DataItem[];
}
