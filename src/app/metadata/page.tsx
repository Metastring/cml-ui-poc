"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
  Loader2,
} from "lucide-react";
import InstructionPopover from "@/element/popover/InstructionPopover";

// --- Types ---
interface Field {
  field_name: string;
  description?: string;
  mappings?: string[];
}

interface Dataset {
  name: string;
  fields?: Field[];
}

interface Category {
  category: string;
  datasets?: Dataset[];
}

// --- Mapping Tag Component ---
const Tag = ({ text }: { text: string }) => (
  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mr-2">
    {text}
  </span>
);

// --- Accordion Component with separate label & title ---
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
  const [open, setOpen] = useState(defaultOpen);

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
            {label && (
              <span className="text-gray-700 font-semibold text-base">
                {label} :
              </span>
            )}
            <span className="text-gray-900">{title}</span>
          </div>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-[999px] mt-2" : "max-h-0"
        }`}
      >
        {open && <div className="pl-6">{children}</div>}
      </div>
    </div>
  );
};

// --- Main Page Component ---
const Page = () => {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_FEDERATED_BASE_URL + "/metadata"
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const json: Category[] = await res.json();
        setData(json);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-6">Error: {error}</div>;
  }

  return (
    <div className="h-screen overflow-y-auto p-6 bg-white text-sm flex flex-col space-y-2">
      <InstructionPopover title="Metadata">
        <p className="mb-2">
          The metadata displayed here is collected from multiple remote datasets. It helps users explore the structure and
          content of available data sources.
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
          <li>
            <strong>Category:</strong> Broad grouping of datasets, e.g.,{" "}
            <code>biodiversity</code>.
          </li>
          <li>
            <strong>Dataset:</strong> A specific dataset within a category, such
            as <code>cpmp</code>.
          </li>
          <li>
            <strong>Field:</strong> Attributes within a dataset.
          </li>
        </ul>
      </InstructionPopover>

      {data.map((cat, i) => (
        <Accordion
          key={i}
          label="Category"
          title={cat.category}
          icon={<Folder size={16} />}
        >
          {cat.datasets?.map((ds, j) => (
            <Accordion
              key={j}
              label="Dataset"
              title={ds.name}
              icon={<FileText size={16} />}
            >
              <div className="grid gap-4 max-h-72 overflow-y-auto pr-2">
                {ds.fields?.map((field, k) => (
                  <div
                    key={k}
                    className="p-4 border rounded bg-gray-50 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-md font-semibold text-gray-800">
                        Field:{" "}
                        <span className="text-blue-700">
                          {field.field_name}
                        </span>
                      </h4>
                    </div>
                    {field.description && (
                      <p className="mt-1 text-gray-600 text-sm">
                        <span className="font-medium">Description:</span>{" "}
                        {field.description}
                      </p>
                    )}
                    {Array.isArray(field.mappings) &&
                      field.mappings.length > 0 && (
                        <div className="mt-1 text-gray-600 text-sm">
                          <span className="font-medium">Mappings:</span>
                          <div className="mt-1 flex flex-wrap">
                            {field.mappings.map((map, m) => (
                              <Tag key={m} text={map} />
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </Accordion>
          ))}
        </Accordion>
      ))}
    </div>
  );
};

export default Page;
