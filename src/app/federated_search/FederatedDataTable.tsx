"use client";

import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useGetMapDataBasedOnFederatedSearchResult } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import useFederatedSearchMapData from "@/store/federated_search_store/useFederatedSearchMapData";

export type DataItem = {
  decimalLatitude?: number;
  decimalLongitude?: number;
  taxon_name?: string;
  common_names?: string;
  scientific_name?: string;
  common_name?: string;
    eventDate?:string;
        basisOfRecord?:string;
};

type FederatedDataTableProps = {
  isLoading: boolean;
  isError: boolean;
  data: DataItem[];
  onSearch: ()=>void
};

const FederatedDataTable: React.FC<FederatedDataTableProps> = ({
  isLoading,
  isError,
  data = [],
  onSearch
}) => {
  const [checkedRows, setCheckedRows] = useState<boolean[]>([]);
  const { addVisibleMarker, removeMarkerByName } =
    useFederatedSearchMapData();

  const { mutate: fetchMapData, data: mapData = [] } =
    useGetMapDataBasedOnFederatedSearchResult();

  // Initialize checkbox state when data changes
  useEffect(() => {
    setCheckedRows(new Array(data.length).fill(false));
  }, [data.length]);

  // Add markers when mapData arrives
  useEffect(() => {
    if (!mapData?.length) return;

    mapData.forEach(
      (item: {
        latitude: number;
        longitude: number;
        scientificName: string;
        dataset:string;
        eventDate:string;
        basisOfRecord:string;
      }) => {
        if (item.latitude && item.longitude) {
          addVisibleMarker({
            scientificName: item.scientificName,
            dataset:item.dataset,
            eventDate:item.eventDate,
            basisOfRecord:item.basisOfRecord,
            lat: item.latitude,
            lng: item.longitude,
          });
        }
      }
    );
  }, [mapData, addVisibleMarker]);

  // Handle row toggle
const handleToggleSelection = (row: DataItem, index: number) => {
  setCheckedRows((prev) => {
    const newState = [...prev];
    const newChecked = !newState[index];
    newState[index] = newChecked;

    const name = row.scientific_name || row.taxon_name;
    if (!name) return newState;

    if (newChecked) {
      fetchMapData(name);
    } else {
      // ✅ remove all markers for this species
      removeMarkerByName(name);
    }

    return newState;
  });
  onSearch?.();
};

  const TableHeader = () => (
    <thead className="bg-gray-200 font-semibold tracking-wider border-b border-gray-300">
      <tr>
        <th className="px-6 py-4">View Distribution</th>
        <th className="px-6 py-4">Scientific Name</th>
        <th className="px-6 py-4">Common Name</th>
      </tr>
    </thead>
  );

  if (isLoading) {
    return (
      <div className="flex h-full justify-center rounded-2xl">
        <table className="min-w-full text-sm text-left text-gray-800 border rounded-2xl overflow-hidden">
          <TableHeader />
          <tbody>
            <tr>
              <td colSpan={3} className="text-center text-gray-500 italic">
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
  }

  if (isError) {
    return (
      <div className="flex h-full justify-center rounded-2xl">
        <table className="min-w-full text-sm text-left text-gray-800 border rounded-2xl overflow-hidden">
          <TableHeader />
          <tbody>
            <tr>
              <td colSpan={3} className="text-center text-red-500 italic py-6">
                Oops! Something went wrong while loading data.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full justify-center rounded-2xl">
        <table className="min-w-full text-sm text-left text-gray-800 border rounded-2xl overflow-hidden">
          <TableHeader />
          <tbody>
            <tr>
              <td colSpan={3} className="text-center text-gray-500 italic py-6">
                No data available
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <div className="min-w-full bg-white shadow-xl rounded-xl overflow-hidden">
        <table className="min-w-full text-sm text-left text-gray-800">
          <TableHeader />
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => {
              const name = row.scientific_name || row.taxon_name;

              return (
                <tr
                  key={index}
                  className={`cursor-pointer transition-colors ${
                    checkedRows[index]
                      ? "bg-blue-100 hover:bg-blue-200"
                      : "hover:bg-blue-50"
                  }`}
                  onClick={() => handleToggleSelection(row, index)}
                >
                  <td
                    className="px-6 py-4"
                    title="view/Hide on Map"
                    // onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={!!checkedRows[index]}
                      onCheckedChange={() =>
                        handleToggleSelection(row, index)
                      }
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
