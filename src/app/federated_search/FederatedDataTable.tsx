'use client';

import React from 'react';
import GenericTable from '@/element/table/GenericTable';
import dummy_data from '../../../public/species.json';
import { useGetFederatedResultByQuery } from '@/api/federatedSearchApiHandler/FederatedSearchApiHandler';

// Infer type from JSON structure
type Species = typeof dummy_data[number];
type SpeciesKey = keyof Species;

const FederatedDataTable = () => {
  const { data, isLoading, error } = useGetFederatedResultByQuery();

  const formatHeader = (key: string) =>
    key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const columns = (Object.keys(dummy_data[0]) as SpeciesKey[]).map((key) => ({
    key,
    header: formatHeader(key),
  }));

  return (
    <div className="mt-4">
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Failed to load data.</p>}

      <GenericTable<Species>
        columns={columns}
        data={(data as Species[]) ?? dummy_data}
        rowKey="id"
      />
    </div>
  );
};

export default FederatedDataTable;
