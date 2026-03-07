"use client";

import React, { useState, useEffect } from "react";
import { Loader2, ExternalLink, EyeOff } from "lucide-react";
import { useGetMapDataBasedOnFederatedSearchResult } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import useFederatedSearchMapData from "@/store/federated_search_store/useFederatedSearchMapData";
import { FederatedDataTableProps } from "@/types/app/federatedSearch.types";
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
      className={className}
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

// Type for small table components props
interface TableStateProps {
  TableHeader: React.FC;
}

const FederatedDataTable: React.FC<FederatedDataTableProps> = ({
  isLoading,
  isError,
  data = [],
  onSearch,
}) => {
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
        <th className="px-6 py-4 text-foreground">Explore on Map</th>
        <th className="px-6 py-4 text-foreground">Scientific Name</th>
        <th className="px-6 py-4 text-foreground">Common Name</th>
        <th className="px-6 py-4 text-foreground">Dataset</th>
      </tr>
    </thead>
  );

  if (isLoading) return <LoadingTable TableHeader={TableHeader} />;
  if (isError) return <ErrorTable TableHeader={TableHeader} />;
  if (data.length === 0) return <EmptyTable TableHeader={TableHeader} />;

  return (
    <div className="overflow-x-auto w-full">
      <div className="min-w-full bg-card shadow-xl rounded-xl overflow-hidden">
        <table className="min-w-full text-sm text-left text-foreground">
          <TableHeader />
          <tbody className="divide-y divide-border">
            {data.map((row, index) => {
              const name = row.scientific_name || row.taxon_name;
              return (
                <tr
                  key={index}
                  className={`cursor-pointer transition-colors ${
                    checkedRows[index]
                      ? "bg-primary/10 hover:bg-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleToggleSelection(row, index)}
                >
                  <td
                    className="px-6 py-4"
                    title={checkedRows[index] ? "Hide from map" : "View on map"}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSelection(row, index)}
                      className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        checkedRows[index]
                          ? "bg-primary/20 text-primary hover:bg-primary/30"
                          : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {checkedRows[index] ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          View
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <TableCellWithMore text={name} className="whitespace-nowrap" />
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <TableCellWithMore text={row.common_names ?? row.common_name} />
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <TableCellWithMore
                      text={row.dataset ? String(row.dataset).toUpperCase() : null}
                      className="whitespace-nowrap"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FederatedDataTable;

// Small table components with proper types
const LoadingTable: React.FC<TableStateProps> = ({ TableHeader }) => (
  <div className="flex h-full justify-center rounded-2xl">
    <table className="min-w-full text-sm text-left text-foreground border border-border rounded-2xl overflow-hidden bg-card">
      <TableHeader />
      <tbody>
        <tr>
          <td colSpan={4} className="text-center text-muted-foreground italic">
            <div className="flex items-center justify-center py-6">
              <Loader2 className="animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

const ErrorTable: React.FC<TableStateProps> = ({ TableHeader }) => (
  <div className="flex h-full justify-center rounded-2xl">
    <table className="min-w-full text-sm text-left text-foreground border border-border rounded-2xl overflow-hidden bg-card">
      <TableHeader />
      <tbody>
        <tr>
          <td colSpan={4} className="text-center text-destructive italic py-6">
            Oops! Something went wrong while loading data.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

const EmptyTable: React.FC<TableStateProps> = ({ TableHeader }) => (
  <div className="flex h-full justify-center rounded-2xl">
    <table className="min-w-full text-sm text-left text-foreground border border-border rounded-2xl overflow-hidden bg-card">
      <TableHeader />
      <tbody>
        <tr>
          <td colSpan={4} className="text-center text-muted-foreground italic py-6">
            No data available
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);
