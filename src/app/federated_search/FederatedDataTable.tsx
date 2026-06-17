"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ExternalLink, MoreVertical } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useGetMapDataBasedOnFederatedSearchResult } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import useFederatedSearchMapData from "@/store/federated_search_store/useFederatedSearchMapData";
import { FederatedDataTableProps, fieldLabel } from "@/types/app/federatedSearch.types";
import { DataItem, MapDataItem } from "@/types/api/federatedSearch.types";
const MAX_CELL_CHARS = 45;

function TableCellWithMore({
  text,
  className = "",
}: {
  text: string | null | undefined;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const str = text != null ? String(text).trim() : "";
  const isLong = str.length > MAX_CELL_CHARS;
  const truncated = isLong ? `${str.slice(0, MAX_CELL_CHARS)}…` : str;
  if (!str) return <span className={className}>—</span>;
  if (!isLong) return <span className={className}>{str}</span>;
  return (
    <span
      className={`${className} inline-block max-w-xs align-top`}
      style={{ whiteSpace: "normal", wordBreak: "break-all" }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {expanded ? str : truncated}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((prev) => !prev);
        }}
        className="ml-1.5 text-primary font-medium text-xs hover:underline"
      >
        {expanded ? "See less" : "See more"}
      </button>
    </span>
  );
}

// Minimal state tables (no proper header until data is loaded)

const FederatedDataTable: React.FC<FederatedDataTableProps> = ({
  isLoading,
  isError,
  data = [],
  fieldColumns = [],
  onSearch,
  embedded = false,
}) => {
  const cellPad = embedded ? "px-2 py-1.5 text-xs" : "px-6 py-4";
  const headPad = embedded ? "px-2 py-1.5 text-[11px]" : "px-6 py-4";
  const router = useRouter();
  const [checkedRows, setCheckedRows] = useState<boolean[]>([]);
  const { addVisibleMarker, removeMarkerByName } = useFederatedSearchMapData();

  const { mutate: fetchMapData, data: mapData = [] } =
    useGetMapDataBasedOnFederatedSearchResult();

  // Initialize checkbox state when data changes
  useEffect(() => {
    setCheckedRows(new Array(data.length).fill(false));
  }, [data.length]);

  // Add markers when mapData arrives
  useEffect(() => {
    if (!mapData.length) return;

    mapData.forEach((item: MapDataItem) => {
      if (item.latitude && item.longitude) {
        addVisibleMarker({
          lat: item.latitude,
          lng: item.longitude,
          scientificName: item.scientificName,
          dataset: item.dataset,
          eventDate: item.eventDate,
          basisOfRecord: item.basisOfRecord,
        });
      }
    });
  }, [mapData, addVisibleMarker]);

  const handleExploreDataset = (row: DataItem) => {
    const datasetName = row.dataset ? String(row.dataset).trim() : null;
    if (!datasetName) return;
    const category =
      (row as Record<string, unknown>).category != null
        ? String((row as Record<string, unknown>).category)
        : "Biodiversity";
    const path = `/datasets/${encodeURIComponent(category)}/${encodeURIComponent(datasetName)}`;
    router.push(path);
  };

  // Handle row toggle — only set "on map" when API returns occurrence data
  const handleToggleSelection = (row: DataItem, index: number) => {
    const name = row.scientific_name || row.taxon_name;
    if (!name) return;

    const currentlyOnMap = checkedRows[index];
    if (currentlyOnMap) {
      setCheckedRows((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
      removeMarkerByName(name);
      onSearch?.();
      return;
    }

    // View: fetch first; only toggle icon when we get occurrence data
    fetchMapData(name, {
      onSuccess: (result) => {
        if (result && result.length > 0) {
          setCheckedRows((prev) => {
            const next = [...prev];
            data.forEach((r, idx) => {
              const rn = r.scientific_name || r.taxon_name;
              if (rn === name) next[idx] = true;
            });
            return next;
          });
          onSearch?.();
        }
      },
    });
  };

  const TableHeader: React.FC = () => (
    <thead className="bg-muted font-semibold tracking-wider border-b border-border">
      <tr>
        <th className={`${headPad} text-foreground`}>Explore</th>
        {fieldColumns.map((field) => (
          <th key={field} className={`${headPad} text-foreground`}>
            {fieldLabel(field)}
          </th>
        ))}
        {!embedded && (
          <th className={`${headPad} text-foreground`}>Dataset</th>
        )}
      </tr>
    </thead>
  );

  // Before data is fetched: show minimal table with no proper header
  if (isLoading) return <LoadingTable />;
  if (isError) return <ErrorTable />;
  if (data.length === 0) return <EmptyTable />;

  // Only after data is loaded: show full table with dynamic header from API

  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <div
        className={`min-w-max w-full bg-card overflow-hidden ${
          embedded ? "rounded-md border border-border/60" : "shadow-xl rounded-xl"
        }`}
      >
        <table className="min-w-max w-full text-sm text-left text-foreground">
          <TableHeader />
          <tbody className="divide-y divide-border">
            {data.map((row, index) => {
              return (
                <ContextMenu key={index}>
                  <ContextMenuTrigger asChild>
                    <tr
                      className={`transition-colors ${
                        checkedRows[index]
                          ? "bg-primary/10 hover:bg-primary/20"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <td
                        className={cellPad}
                        title="View records"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const ev = new MouseEvent("contextmenu", {
                                bubbles: true,
                                cancelable: true,
                                clientX: e.clientX,
                                clientY: e.clientY,
                              });
                              (e.currentTarget as HTMLElement).dispatchEvent(ev);
                            }}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="More options"
                            aria-label="Open menu"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/federated_search/records");
                            }}
                            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View records
                          </button>
                        </div>
                      </td>
                  {fieldColumns.map((field) => {
                    const value = row[field];
                    const text =
                      value !== undefined && value !== null ? String(value) : null;
                    return (
                      <td
                        key={field}
                        className={cellPad}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TableCellWithMore text={text} />
                      </td>
                    );
                  })}
                  {!embedded && (
                    <td className={cellPad} onClick={(e) => e.stopPropagation()}>
                      <TableCellWithMore
                        text={
                          row.dataset ? String(row.dataset).toUpperCase() : null
                        }
                        className=""
                      />
                    </td>
                  )}
                    </tr>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onSelect={() => handleExploreDataset(row)}
                      description="Open the dataset page for this result in the catalog."
                    >
                      Explore dataset
                    </ContextMenuItem>
                    <ContextMenuItem
                      onSelect={() => handleToggleSelection(row, index)}
                      disabled={row.is_occurance_available !== true}
                      description={
                        row.is_occurance_available === true
                          ? "Add this result to the map to view occurrence locations."
                          : "Sorry — occurrence data is not available for this dataset."
                      }
                    >
                      Explore on map
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FederatedDataTable;

// Minimal table with no header — shown until data is fetched
const LoadingTable: React.FC = () => (
  <div className="flex h-full justify-center rounded-2xl">
    <table className="min-w-full text-sm text-left text-foreground border border-border rounded-2xl overflow-hidden bg-card">
      <tbody>
        <tr>
          <td className="text-center text-muted-foreground italic py-12">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading...</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

const ErrorTable: React.FC = () => (
  <div className="flex h-full justify-center rounded-2xl">
    <table className="min-w-full text-sm text-left text-foreground border border-border rounded-2xl overflow-hidden bg-card">
      <tbody>
        <tr>
          <td className="text-center text-destructive italic py-12">
            Oops! Something went wrong while loading data.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

const EmptyTable: React.FC = () => (
  <div className="flex h-full justify-center rounded-2xl">
    <table className="min-w-full text-sm text-left text-foreground border border-border rounded-2xl overflow-hidden bg-card">
      <tbody>
        <tr>
          <td className="text-center text-muted-foreground italic py-12">
            No data available. Run a search to see results.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);
