"use client";

import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useGetMapDataBasedOnFederatedSearchResult } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import useFederatedSearchMapData from "@/store/federated_search_store/useFederatedSearchMapData";
import { FederatedDataTableProps } from "@/types/app/federatedSearch.types";
import { DataItem, MapDataItem } from "@/types/api/federatedSearch.types";

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

  // Handle row toggle
  const handleToggleSelection = (row: DataItem, index: number) => {
    setCheckedRows((prev) => {
      const newState = [...prev];
      const newChecked = !newState[index];
      newState[index] = newChecked;

      const name = row.scientific_name || row.taxon_name;
      if (!name) return newState;

      if (newChecked) fetchMapData(name);
      else removeMarkerByName(name);

      return newState;
    });
    onSearch?.();
  };

  const TableHeader: React.FC = () => (
    <thead className="bg-muted font-semibold tracking-wider border-b border-border">
      <tr>
        <th className="px-6 py-4 text-foreground">View Distribution</th>
        <th className="px-6 py-4 text-foreground">Scientific Name</th>
        <th className="px-6 py-4 text-foreground">Common Name</th>
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
                  <td className="px-6 py-4" title="view/Hide on Map">
                    <Checkbox
                      checked={!!checkedRows[index]}
                      onCheckedChange={() => handleToggleSelection(row, index)}
                       onClick={(e) => e.stopPropagation()} 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{name}</td>
                  <td className="px-6 py-4">
                    {row.common_names ?? row.common_name}
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
          <td colSpan={3} className="text-center text-muted-foreground italic">
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
          <td colSpan={3} className="text-center text-destructive italic py-6">
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
          <td colSpan={3} className="text-center text-muted-foreground italic py-6">
            No data available
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);
