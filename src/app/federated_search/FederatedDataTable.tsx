"use client";

import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export type DataItem = {
  decimalLatitude?: number;
  decimalLongitude?: number;
  taxon_name?: string;
  common_names?: string;
  scientific_name?: string;
  common_name?: string;
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

  useEffect(() => {
    setCheckedRows((prev) => {
      // Only reset if row count changed
      if (prev.length !== data.length) {
        return new Array(data.length).fill(true);
      }
      return prev;
    });
  }, [data.length]);

  const handleRowClick = (row: DataItem, index: number) => {
    // click logic
    console.log(row)
    console.log(index)
  };

  const handleCheckboxChange = (index: number) => {
    setCheckedRows((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const TableHeader = () => (
    <thead className="bg-gray-200 text-xs uppercase font-semibold tracking-wider border-b border-gray-300">
      <tr>
        <th className="px-6 py-4">View on Map</th>
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
            {data.map((row, index) => (
              <tr
                key={index}
                onClick={() => handleRowClick(row, index)}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4" title="view on map feature is not ready yet!">
                  <Checkbox
                    checked={!!checkedRows[index]}
                    onCheckedChange={() => handleCheckboxChange(index)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {row.taxon_name ?? row.scientific_name}
                </td>
                <td className="px-6 py-4">{row.common_names ?? row.common_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FederatedDataTable;
