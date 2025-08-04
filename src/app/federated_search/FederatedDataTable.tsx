// "use client";

// import React, { useEffect, useState } from "react";
// import GenericTable from "@/element/table/GenericTable";
// import { useFederatedSearchResult } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
// import { useFederatedSearchStore } from "@/store/useFederatedSearchStore";

// interface GenericDataRow {
//   [key: string]: unknown;
// }

// const FederatedDataTable = () => {
//   const { query, datasets, categories } = useFederatedSearchStore();
//   const { data, error, isLoading } = useFederatedSearchResult(
//     query,
//     [categories],
//     datasets
//   );
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);

//   // console.log("data", data?.results);
//   const dataSets: { name: string; count: number }[] = data?.results
//     ? Object.entries(
//         data.results as Record<string, { results?: unknown[] }>
//       ).map(([key, value]) => ({
//         name: key,
//         count: value.results?.length ?? 0,
//       }))
//     : [];

//   // console.log(dataSets)

//   useEffect(() => {
//     if (dataSets?.length && !activeCategory) {
//       setActiveCategory(dataSets[0].name);
//     }
//   }, [dataSets, activeCategory]);

//   // Handle chip click
//   const handleChipClick = (categoryName: string) => {
//     setActiveCategory(categoryName);
//   };

//   // Determine table data for active category
//   const tableData: GenericDataRow[] =
//     activeCategory && data?.results?.[activeCategory]?.results
//       ? [...data.results[activeCategory].results]
//       : [];

//   //   console.log("Active category:", activeCategory);
//   // console.log("Available keys in data.results:", data?.results && Object.keys(data.results));
//   // console.log("Table data:", tableData);

//   const formatHeader = (key: string) =>
//     key
//       .split("_")
//       .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//       .join(" ");

//   const columns =
//     tableData.length > 0
//       ? Object.keys(tableData[0]).map((key) => ({
//           key,
//           header: formatHeader(key),
//         }))
//       : [];

//   return (
//     <div className="mt-4 w-full">
//       {isLoading && <p>Loading...</p>}
//       {error && <p className="text-red-500">Failed to load data.</p>}

//       {/* Chips */}
//       {dataSets.length > 0 && (
//         <div className="flex gap-2 flex-wrap mb-4">
//           {dataSets.map((item) => (
//             <button
//               key={item.name}
//               onClick={() => handleChipClick(item.name)}
//               className={`text-sm px-3 py-1 rounded-full shadow-sm border transition ${
//                 activeCategory === item.name
//                   ? "bg-blue-600 text-white"
//                   : "bg-blue-100 text-blue-700 hover:bg-blue-200"
//               }`}
//             >
//               {item.name} ({item.count})
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Table */}
//       {tableData.length > 0 && columns.length > 0 ? (
//         <GenericTable<GenericDataRow>
//           key={activeCategory} // ensure re-render
//           columns={columns}
//           data={tableData}
//           rowKey="taxon_id"
//         />
//       ) : (
//         !isLoading && (
//           <div className="h-full w-full flex justify-center items-center">
//             <p className="text-gray-500 text-sm italic">
//               No results to display.
//             </p>
//           </div>
//         )
//       )}
//     </div>
//   );
// };

// export default FederatedDataTable;
