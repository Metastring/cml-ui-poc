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
};

const FederatedDataTable: React.FC<FederatedDataTableProps> = ({
  isLoading,
  isError,
  data = [],
}) => {
  const [checkedRows, setCheckedRows] = useState<boolean[]>([]);
  const [selectedScientificName, setSelectedScientificName] = useState<
    string | null
  >(null);
  const { addVisibleMarker, clearCoordinates } = useFederatedSearchMapData();

  // this api is being used for fetching the map data based on scietific name
  const {
    mutate: fetchMapData,
    data: mapData = [],
    // isPending: isLoadingMapData,
    // isError: isErrorMapData,
    // error,
  } = useGetMapDataBasedOnFederatedSearchResult();

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
  }, [mapData, addVisibleMarker, clearCoordinates]);

  useEffect(() => {
    setCheckedRows((prev) => {
      if (prev.length !== data.length) {
        return new Array(data.length).fill(false);
      }
      return prev;
    });
  }, [data.length]);

const handleRowClick = (row: DataItem, index: number) => {
  const name = row.scientific_name || row.taxon_name;
  if (!name) return;

  setCheckedRows(() => {
    const newState = new Array(data.length).fill(false); // reset all
    newState[index] = true; // select only this one

    setSelectedScientificName(name);
    clearCoordinates();
    fetchMapData(name);

    return newState;
  });
};

const handleCheckboxChange = (row: DataItem, index: number) => {
  const name = row.scientific_name || row.taxon_name;
  if (!name) return;

  setCheckedRows(() => {
    const newState = new Array(data.length).fill(false); // reset all
    newState[index] = true; // select only this one

    setSelectedScientificName(name);
    clearCoordinates();
    fetchMapData(name);

    return newState;
  });
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
              const isSelected = name === selectedScientificName;

              return (
                <tr
                  key={index}
                  onClick={() => handleRowClick(row, index)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-100 hover:bg-blue-200" // ✅ highlight selected
                      : "hover:bg-blue-50"
                  }`}
                >
                  <td
                    className="px-6 py-4"
                    title="view/Hide on Map"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={!!checkedRows[index]}
                      onCheckedChange={() => handleCheckboxChange(row, index)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {row.taxon_name ?? row.scientific_name}
                  </td>
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
