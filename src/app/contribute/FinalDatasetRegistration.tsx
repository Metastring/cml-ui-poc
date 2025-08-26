"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

// Define final dataset form type
export interface FinalDatasetForm {
  dataset_id: string;
  scopes: { name: string }[];
  publishers: { name: string }[];
  contacts: { name: string }[];
  mappings: { name: string }[];
  metrics: { name: string }[];
  statistics: { name: string }[];
}

interface FinalDatasetRegistrationProps {
  datasetId: string; // required from initial step
  onSubmit: (data: FinalDatasetForm) => void;
  isSubmitting?: boolean;
  onBackToInitial?: () => void; // optional callback
}

const FinalDatasetRegistration: React.FC<FinalDatasetRegistrationProps> = ({
  datasetId,
  onSubmit,
  isSubmitting = false,
  onBackToInitial,
}) => {
  const [scopes, setScopes] = useState<string[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [contacts, setContacts] = useState<string[]>([]);
  const [mappings, setMappings] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<string[]>([]);

  const fields = [
    { id: "scopes", label: "Scopes", value: scopes, setter: setScopes },
    { id: "publishers", label: "Publishers", value: publishers, setter: setPublishers },
    { id: "contacts", label: "Contacts", value: contacts, setter: setContacts },
    { id: "mappings", label: "Mappings", value: mappings, setter: setMappings },
    { id: "metrics", label: "Metrics", value: metrics, setter: setMetrics },
    { id: "statistics", label: "Statistics", value: statistics, setter: setStatistics },
  ];

  useEffect(() => {
    if (!datasetId || datasetId.trim() === "") {
      toast.error("Invalid dataset ID! Please complete initial registration first.");
      if (onBackToInitial) onBackToInitial();
    }
  }, [datasetId, onBackToInitial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!datasetId || datasetId.trim() === "") {
      toast.error("Cannot submit final dataset. Invalid dataset ID.");
      return;
    }

    const emptyFields = fields.filter(f => f.value.length === 0);
    if (emptyFields.length > 0) {
      toast.error(
        `Please fill all required fields: ${emptyFields.map(f => f.label).join(", ")}`
      );
      return;
    }

    const payload: FinalDatasetForm = {
      dataset_id: datasetId,
      scopes: scopes.map(name => ({ name })),
      publishers: publishers.map(name => ({ name })),
      contacts: contacts.map(name => ({ name })),
      mappings: mappings.map(name => ({ name })),
      metrics: metrics.map(name => ({ name })),
      statistics: statistics.map(name => ({ name })),
    };

    onSubmit(payload);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    setter: (val: string[]) => void,
    value: string[]
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.currentTarget.value.trim();
      if (input && !value.includes(input)) setter([...value, input]);
      e.currentTarget.value = "";
    }
  };

  const removeItem = (item: string, setter: (val: string[]) => void, value: string[]) => {
    setter(value.filter(v => v !== item));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl w-full mx-auto p-6 bg-white shadow-md rounded-lg overflow-y-auto h-fit"
    >
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        {fields.map(({ id, label, value, setter }) => (
          <div key={id} className="w-full sm:w-[48%] flex flex-col">
            <Label className="text-sm font-medium text-gray-700 mb-1">
              {label} <span className="text-red-500">*</span>
            </Label>
            <Input
              id={id}
              placeholder={`Type and press Enter to add ${label.toLowerCase()}`}
              onKeyDown={e => handleKeyDown(e, setter, value)}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {value.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-sm rounded-full flex items-center gap-1"
                >
                  {item}
                  <X
                    className="w-4 h-4 text-red-500 hover:text-red-700 text-xs cursor-pointer"
                    onClick={() => removeItem(item, setter, value)}
                  />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-4">
        {onBackToInitial && (
          <Button type="button" variant="outline" onClick={onBackToInitial}>
            Back to Initial
          </Button>
        )}
        <Button type="submit" className="w-full sm:w-1/3" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Dataset"}
        </Button>
      </div>
    </form>
  );
};

export default FinalDatasetRegistration;
