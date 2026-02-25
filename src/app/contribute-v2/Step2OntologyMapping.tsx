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

const ONTOLOGY_OPTIONS = ["Term A", "Term B", "Term C", "Term D", "Other"];

interface MappingRow {
  field_name: string;
  ontology_mapping: string;
  description: string;
}

interface Step2OntologyMappingProps {
  onBack: () => void;
}

const Step2OntologyMapping: React.FC<Step2OntologyMappingProps> = ({
  onBack,
}) => {
  const [rows, setRows] = useState<MappingRow[]>([
    {
      field_name: "",
      ontology_mapping: "",
      description: "",
    },
  ]);

  const updateRow = (index: number, key: keyof MappingRow, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
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
    // UI only - no API call
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-6 bg-white shadow-md rounded-lg h-[80vh] overflow-y-auto">
      <div className="w-full max-w-[50vw] flex flex-col gap-6">
        <div className="space-y-2 text-sm text-gray-600">
          <p className="flex gap-1">
            <span className="font-semibold text-gray-800">
              Dataset Parameter Name:
            </span>
            <span>
              Specify the dataset parameter you want to map to an ontology.
            </span>
          </p>
          <p className="flex gap-1">
            <span className="font-semibold text-gray-800">
              Ontology Parameter:
            </span>
            <span>
              Select an ontology term that defines dataset parameter.
            </span>
          </p>
        </div>

        {rows.map((row, index) => (
          <div key={index} className="w-full flex flex-col gap-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Dataset Parameter Name"
                value={row.field_name}
                onChange={(e) =>
                  updateRow(index, "field_name", e.target.value)
                }
              />
              <Select
                value={row.ontology_mapping || undefined}
                onValueChange={(value) =>
                  updateRow(index, "ontology_mapping", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Ontology Parameter" />
                </SelectTrigger>
                <SelectContent>
                  {ONTOLOGY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Description"
              value={row.description}
              onChange={(e) =>
                updateRow(index, "description", e.target.value)
              }
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addRow}
          className="w-fit"
        >
          + Add more
        </Button>
      </div>

      <div className="mt-6 flex justify-center gap-5">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full sm:w-1/3"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="w-full sm:w-1/3"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Step2OntologyMapping;
