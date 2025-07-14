'use client';

import React from 'react';
import GenericTable, { Column } from '@/element/table/GenericTable';
import { useSpecies } from './useSpecies';

// Define the shape of a species row
interface Species {
  id: number;
  common_name: string;
  scientific_name: string;
  location: string;
  category: string;
  status: string;
}

const PolygonDataTable: React.FC = () => {
  const {  filtered: data } = useSpecies();

  // Convert keys like 'common_name' to 'Common Name'
  const formatHeader = (key: string): string => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Only create columns if data exists
  const columns: Column<Species>[] = data.length
    ? (Object.keys(data[0]) as (keyof Species)[]).map((key) => ({
        key,
        header: formatHeader(key),
      }))
    : [];

  return (
    <div className="w-full">
      <GenericTable columns={columns} data={data} />
    </div>
  );
};

export default PolygonDataTable;
