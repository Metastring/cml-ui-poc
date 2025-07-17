'use client';

import React from 'react';
import GenericTable, { Column } from '@/element/table/GenericTable';
import { useSpecies } from './useSpecies';

const PolygonDataTable: React.FC = () => {
  const { filtered: data } = useSpecies();

  const formatHeader = (key: string): string =>
    key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const columns: Column<Record<string, unknown>>[] = data.length
    ? Object.keys(data[0]).map((key) => ({
        key,
        header: formatHeader(key),
      }))
    : [];

  return (
    <div className="w-full">
    <GenericTable<Record<string, unknown>>
  columns={columns}
  data={data as unknown as Record<string, unknown>[]}
/>
   </div>
  );
};

export default PolygonDataTable;
