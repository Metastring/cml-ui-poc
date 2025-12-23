"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useGetOntologyList } from "@/api/contributeApiHandler/ContributeApiHandler";

interface FinalDatasetRegistrationProps {
  datasetId?: string;
  onSubmit: (data: {
    dataset_id: string;
    mappings: { field_name: string; ontology_mapping: string }[];
  }) => void;
  isSubmitting?: boolean;
  onBackToInitial: () => void;
}

interface MappingRow {
  field_name: string;
  ontology_mapping: string;
  description: string;
}

const FinalDatasetRegistration: React.FC<FinalDatasetRegistrationProps> = ({
  datasetId,
  onSubmit,
  isSubmitting = false,
  onBackToInitial,
}) => {
  const { data: ontologyList = [] } = useGetOntologyList();

  const [rows, setRows] = useState<MappingRow[]>([
    {
      field_name: "",
      ontology_mapping: "",
      description: "",
    },
  ]);

  /* ================= HANDLERS ================= */

  const updateRow = (
    index: number,
    key: keyof MappingRow,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [key]: value } : row
      )
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { field_name: "", ontology_mapping: "", description: "" },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      dataset_id: String(datasetId),
      mappings: rows
        .filter((r) => r.field_name.trim())
        .map((r) => ({
          field_name: r.field_name.trim(),
          ontology_mapping:
            r.ontology_mapping === "other" ? " " : r.ontology_mapping,
        })),
    };

    onSubmit(payload);
  };

  /* ================= RENDER ================= */

  return (
    <div className="max-w-4xl w-full mx-auto p-6 bg-white shadow-md rounded-lg h-[80vh] overflow-y-auto">
      <div className="w-[50vw] flex flex-col gap-6">
        {rows.map((row, index) => (
          <div key={index} className="w-full flex flex-col gap-2">
            {/* ROW 1: FIELD NAME + ONTOLOGY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* LEFT: USER INPUT FIELD NAME */}
              <Input
                placeholder="Field name"
                value={row.field_name}
                onChange={(e) =>
                  updateRow(index, "field_name", e.target.value)
                }
              />

              {/* RIGHT: ONTOLOGY DROPDOWN */}
              <Select
                value={row.ontology_mapping}
                onValueChange={(value) =>
                  updateRow(index, "ontology_mapping", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Ontology Parameter" />
                </SelectTrigger>
                <SelectContent>
                  {ontologyList.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ROW 2: DESCRIPTION */}
            <Input
              placeholder="Description"
              value={row.description}
              onChange={(e) =>
                updateRow(index, "description", e.target.value)
              }
            />
          </div>
        ))}

        {/* ADD MORE */}
        <Button
          type="button"
          variant="outline"
          onClick={addRow}
          className="w-fit"
        >
          + Add more
        </Button>
      </div>

      {/* ACTIONS */}
      <div className="mt-6 flex justify-center gap-5">
        <Button
          type="button"
          variant="outline"
          onClick={onBackToInitial}
          className="w-full sm:w-1/3"
        >
          Back
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-1/3"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default FinalDatasetRegistration;
