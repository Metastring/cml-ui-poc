'use client';

import React from 'react';

export type Column<T> = {
  key: keyof T;
  header: string;
  className?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
};

export interface GenericTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: keyof T | string;
  emptyText?: string;
}

function GenericTable<T extends Record<string, unknown>>({
  columns = [],
  data = [],
  rowKey = 'id',
  emptyText = 'No data found.',
}: GenericTableProps<T>) {
  if (!columns.length) return <div>No columns configured</div>;

  return (
    <div className="max-w-full">
      <div className="max-h-[80vh] overflow-x-auto overflow-y-auto border rounded-lg shadow-md">
        <table className="min-w-fit w-full table-auto border-collapse">
          <thead className="sticky top-0 z-10 bg-white shadow-sm text-nowrap">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-2 text-left text-gray-700 font-semibold ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={String(row[rowKey as keyof T] ?? idx)} className="hover:bg-gray-50 transition">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-2 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-gray-500">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GenericTable;
