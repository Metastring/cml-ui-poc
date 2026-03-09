// src/types/app/mapSearch.types.ts

import { FederatedSearchDataItem } from "@/types/api/mapSearch.types";

export type DataItem = FederatedSearchDataItem;

export interface MapSearchDataTableProps {
  isLoading: boolean;
  isError: boolean;
  onExpandFull?: () => void;
  onCollapseTable?: () => void;
  onRestoreSplit?: () => void;
  isTableExpanded?: boolean;
}
