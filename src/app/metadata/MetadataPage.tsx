"use client";

import React from "react";
import { ChevronDown, ChevronRight, Folder, FileText, Loader2 } from "lucide-react";
import DatasetDetailView from "./DatasetDetailView";
import InstructionPopover from "@/element/popover/InstructionPopover";
import { useGetFilterData } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";

const Accordion = ({
  label,
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  label?: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="mb-2">
      <button
        className="w-full flex items-center justify-between text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-medium transition"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {icon}
          <div className="flex items-center gap-2">
            {label && <span className="text-gray-700 font-semibold">{label}:</span>}
            <span className="text-gray-900">{title}</span>
          </div>
        </div>
      </button>
      {open && <div className="pl-6 mt-2">{children}</div>}
    </div>
  );
};



const MetadataPage = () => {
  const { data, isLoading, error } = useGetFilterData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-6">Error: Something Went Wrong</div>;
  }

  if (!data || data.length === 0) {
    return <div className="p-6 text-gray-500 italic">No categories or datasets found.</div>;
  }

  return (
    <div className="h-screen overflow-y-auto p-6 bg-white text-sm flex flex-col space-y-2">
      <InstructionPopover title="Metadata">
        <p>
          The metadata displayed here is collected from multiple remote datasets.
          Click a category to view its details.
        </p>
      </InstructionPopover>

      {data.map((cat, i) => (
        <Accordion
          key={i}
          label="Category"
          title={cat.category_name}
          icon={<Folder size={16} />}
        >
          {cat.datasets && cat.datasets.length > 0 ? (
            cat.datasets.map((ds, j) => (
              <Accordion
                key={j}
                label="Dataset"
                title={ds.dataset_title}
                icon={<FileText size={16} />}
              >
                <DatasetDetailView
                  categoryName={cat.category_name}
                  datasetTitle={ds.dataset_title}
                />
              </Accordion>
            ))
          ) : (
            <div className="text-gray-500 italic">No datasets available in this category.</div>
          )}
        </Accordion>
      ))}
    </div>
  );
};

export default MetadataPage;
