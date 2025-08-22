// "use client";

// import React, { useState } from "react";
// import { ChevronDown, ChevronRight } from "lucide-react";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent,
// } from "@/components/ui/popover";

// type Dataset = {
//   id: string;
//   name: string;
// };

// type Category = {
//   id: string;
//   category_name: string;
//   datasets: Dataset[];
// };

// const categories: Category[] = [
//   {
//     id: "1",
//     category_name: "Biodiversity",
//     datasets: [
//       { id: "d1", name: "Dataset A" },
//       { id: "d2", name: "Dataset B" },
//       { id: "d3", name: "Dataset C" },
//     ],
//   },
//   {
//     id: "2",
//     category_name: "Climate",
//     datasets: [
//       { id: "d4", name: "Dataset X" },
//       { id: "d5", name: "Dataset Y" },
//     ],
//   },
//   {
//     id: "3",
//     category_name: "Health",
//     datasets: [
//       { id: "d6", name: "Dataset P" },
//       { id: "d7", name: "Dataset Q" },
//       { id: "d8", name: "Dataset R" },
//     ],
//   },
// ];

// const TreeDropdown = () => {
//   const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});
//   const [selected, setSelected] = useState<Record<string, boolean>>({});

//   const toggleNode = (id: string) => {
//     setOpenNodes((prev) => ({ ...prev, [id]: !prev[id] }));
//   };

//   // Toggle category and all children
//   const toggleCategory = (cat: Category) => {
//     const isSelected = selected[cat.id] || false;
//     const newSelected = { ...selected };

//     // Toggle parent
//     newSelected[cat.id] = !isSelected;

//     // Toggle all children
//     cat.datasets.forEach((ds) => {
//       newSelected[ds.id] = !isSelected;
//     });

//     setSelected(newSelected);
//   };

//   // Toggle individual dataset and update parent state
//   const toggleDataset = (cat: Category, datasetId: string) => {
//     const newSelected = { ...selected };
//     newSelected[datasetId] = !newSelected[datasetId];

//     // Check children status
//     const allChecked = cat.datasets.every((ds) => newSelected[ds.id]);
//     const someChecked = cat.datasets.some((ds) => newSelected[ds.id]);

//     if (allChecked) {
//       newSelected[cat.id] = true;
//     } else if (someChecked) {
//       newSelected[cat.id] = "indeterminate" as unknown as boolean; // 👈 handled below
//     } else {
//       newSelected[cat.id] = false;
//     }

//     setSelected(newSelected);
//   };

//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button variant="outline" className="w-[250px] justify-between">
//           Select Datasets
//           <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
//         </Button>
//       </PopoverTrigger>

//       <PopoverContent className="w-[250px] max-h-[300px] overflow-y-auto p-2">
//         {categories.map((cat) => {
//           const allChecked = cat.datasets.every((ds) => selected[ds.id]);
//           const someChecked = cat.datasets.some((ds) => selected[ds.id]);

//           return (
//             <div key={cat.id} className="mb-2">
//               {/* Category Row */}
//               <div className="flex items-center space-x-2">
//                 <button onClick={() => toggleNode(cat.id)} className="p-1">
//                   {openNodes[cat.id] ? (
//                     <ChevronDown size={16} />
//                   ) : (
//                     <ChevronRight size={16} />
//                   )}
//                 </button>

//                 <Checkbox
//                   checked={allChecked}
//                   onCheckedChange={() => toggleCategory(cat)}
//                   // shadcn/ui Checkbox supports indeterminate
//                   ref={(el) => {
//                     if (el) {
//                       el.indeterminate = !allChecked && someChecked;
//                     }
//                   }}
//                 />
//                 <span>{cat.category_name}</span>
//               </div>

//               {/* Datasets */}
//               {openNodes[cat.id] && (
//                 <div className="ml-10 mt-1 space-y-1 border-l-2 pl-4 border-muted ">
//                   {cat.datasets.map((ds) => (
//                     <div key={ds.id} className="flex items-center space-x-2">
//                       <Checkbox
//                         checked={selected[ds.id] || false}
//                         onCheckedChange={() => toggleDataset(cat, ds.id)}
//                       />
//                       <span>{ds.name}</span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </PopoverContent>
//     </Popover>
//   );
// };

// export default TreeDropdown;
