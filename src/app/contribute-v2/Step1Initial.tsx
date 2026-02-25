"use client";

import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Upload } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "1", label: "Category A" },
  { value: "2", label: "Category B" },
  { value: "3", label: "Category C" },
];

const FIELD_LABELS = [
  "Dataset Title",
  "Dataset Type",
  "Description",
  "Citation",
  "DOI",
  "Language",
  "Data Language",
  "License",
  "Keywords",
];

const ACCEPT_FILES = ".json,.xlsx,.xls";

interface Step1InitialProps {
  onNext: () => void;
}

const Step1Initial: React.FC<Step1InitialProps> = ({ onNext }) => {
  const [useTraditionalForm, setUseTraditionalForm] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categoryId, setCategoryId] = useState("");
  const [publisherName, setPublisherName] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    Object.fromEntries(FIELD_LABELS.map((l) => [l, ""]))
  );
  const [contacts, setContacts] = useState([
    {
      name: "",
      role: "",
      email: "",
      organization: "",
      address: "",
      city: "",
      state: "",
      country: "",
    },
  ]);
  const [sources, setSources] = useState([
    { source_name: "", base_url: "", description: "" },
  ]);
  const [statistics, setStatistics] = useState([
    { stat_name: "", stat_value: "" },
  ]);

  const updateContact = (i: number, key: string, value: string) => {
    setContacts((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, [key]: value } : c))
    );
  };
  const updateSource = (i: number, key: string, value: string) => {
    setSources((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [key]: value } : s))
    );
  };
  const updateStat = (i: number, key: string, value: string) => {
    setStatistics((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [key]: value } : s))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) {
      setUploadFile(null);
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "json") {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          JSON.parse(text);
          setUploadFile(file);
        } catch {
          setUploadError("Invalid JSON file");
          setUploadFile(null);
        }
      };
      reader.readAsText(file);
    } else {
      setUploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleFileChange({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  // Default: file upload UI
  if (!useTraditionalForm) {
    return (
      <div className="max-w-4xl w-full mx-auto p-6 bg-white shadow-md rounded-lg min-h-[300px]">
        <Label className="pb-2 block">Upload metadata (JSON or Excel)</Label>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_FILES}
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <p className="text-gray-600">
            Drag and drop a file here, or click to browse
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Accepted: .json, .xlsx, .xls
          </p>
          {uploadFile && (
            <p className="mt-3 text-sm font-medium text-green-700">
              {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
          {uploadError && (
            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
          )}
        </div>
        <div className="mt-6 flex flex-col items-center gap-4">
          <Button
            type="button"
            onClick={onNext}
            disabled={!uploadFile}
            className="w-full sm:w-1/3"
          >
            Next
          </Button>
          <button
            type="button"
            onClick={() => setUseTraditionalForm(true)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Use traditional form to add data instead
          </button>
        </div>
      </div>
    );
  }

  // Traditional form UI
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl w-full mx-auto p-6 bg-white shadow-md rounded-lg h-[80vh] overflow-y-auto"
    >
      <button
        type="button"
        onClick={() => setUseTraditionalForm(false)}
        className="text-sm text-blue-600 hover:text-blue-800 underline mb-4"
      >
        Use file upload instead
      </button>
      <div className="flex flex-wrap gap-x-4 gap-y-4">
        <div className="flex flex-wrap gap-4 w-full">
          <div className="w-full sm:w-[48%]">
            <Label className="pb-1">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="pb-1">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {FIELD_LABELS.map((label) => (
            <div key={label} className="w-full sm:w-[48%]">
              <Label className="pb-1">{label}</Label>
              <Input
                value={fieldValues[label] ?? ""}
                onChange={(e) =>
                  setFieldValues((prev) => ({ ...prev, [label]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>

        <div className="w-full">
          <Label className="font-semibold pb-1">Publisher</Label>
          <Input
            placeholder="Publisher Name"
            value={publisherName}
            onChange={(e) => setPublisherName(e.target.value)}
            className="mb-2"
          />
          <Label className="pb-1">Publisher Contact</Label>
          {contacts.map((c, i) => (
            <div
              key={i}
              className="border p-3 rounded bg-gray-50 mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {(Object.keys(c) as (keyof typeof c)[]).map((field) => (
                <Input
                  className="bg-white"
                  key={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={c[field]}
                  onChange={(e) => updateContact(i, field, e.target.value)}
                />
              ))}
              {contacts.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    setContacts((prev) => prev.filter((_, idx) => idx !== i))
                  }
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setContacts((prev) => [
                ...prev,
                {
                  name: "",
                  role: "",
                  email: "",
                  organization: "",
                  address: "",
                  city: "",
                  state: "",
                  country: "",
                },
              ])
            }
          >
            + Add More
          </Button>
        </div>

        <div className="w-full">
          <Label className="font-semibold pb-1">Source</Label>
          {sources.map((s, i) => (
            <div
              key={i}
              className="border p-3 rounded bg-gray-50 mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2"
            >
              <Input
                className="bg-white"
                placeholder="Source Name"
                value={s.source_name}
                onChange={(e) => updateSource(i, "source_name", e.target.value)}
              />
              <Input
                className="bg-white"
                placeholder="Base URL"
                value={s.base_url}
                onChange={(e) => updateSource(i, "base_url", e.target.value)}
              />
              <Input
                className="bg-white"
                placeholder="Description"
                value={s.description}
                onChange={(e) =>
                  updateSource(i, "description", e.target.value)
                }
              />
              {sources.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    setSources((prev) => prev.filter((_, idx) => idx !== i))
                  }
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setSources((prev) => [
                ...prev,
                { source_name: "", base_url: "", description: "" },
              ])
            }
          >
            + Add More
          </Button>
        </div>

        <div className="w-full">
          <Label className="font-semibold pb-1">Statistic</Label>
          {statistics.map((s, i) => (
            <div
              key={i}
              className="border p-3 rounded bg-gray-50 mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2"
            >
              <Input
                className="bg-white"
                placeholder="Stat Name"
                value={s.stat_name}
                onChange={(e) => updateStat(i, "stat_name", e.target.value)}
              />
              <Input
                className="bg-white"
                placeholder="Stat Value"
                value={s.stat_value}
                onChange={(e) => updateStat(i, "stat_value", e.target.value)}
              />
              {statistics.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    setStatistics((prev) =>
                      prev.filter((_, idx) => idx !== i)
                    )
                  }
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setStatistics((prev) => [
                ...prev,
                { stat_name: "", stat_value: "" },
              ])
            }
          >
            + Add More
          </Button>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button type="submit" className="w-full sm:w-1/3">
          Next
        </Button>
      </div>
    </form>
  );
};

export default Step1Initial;
