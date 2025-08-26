"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

// Define exact type for initial dataset form
export interface InitialDatasetForm {
  title: string;
  description: string;
  citation: string;
  doi: string;
  language: string;
  data_language: string;
  license: string;
  publication_date: Date;
  metadata_modified_date: Date;
  registration_date: Date;
  is_active: boolean;
  keywords: string;
  dataset_type: string;
  category_id: string;
}

interface InitialDatasetRegistrationProps {
  onNext: (data: InitialDatasetForm) => void;
  isSubmitting?: boolean;
}

const InitialDatasetRegistration = ({ onNext, isSubmitting = false }: InitialDatasetRegistrationProps) => {
  const [formData, setFormData] = useState<InitialDatasetForm>({
    title: "",
    description: "",
    citation: "",
    doi: "",
    language: "",
    data_language: "",
    license: "",
    publication_date: new Date(),
    metadata_modified_date: new Date(),
    registration_date: new Date(),
    is_active: true,
    keywords: "",
    dataset_type: "",
    category_id: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: keyof InitialDatasetForm, date: Date | undefined) => {
    if (date) setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const emptyFields = Object.entries(formData).filter(([, value]) => {
      if (value instanceof Date || typeof value === "boolean") return false; // dates & booleans are always set
      return value === "" || value === null;
    });

    if (emptyFields.length > 0) {
      toast.error(`Please fill all required fields.`);
      return;
    }

    // Format dates before sending
    const payload: InitialDatasetForm = {
      ...formData,
      publication_date: new Date(format(formData.publication_date, "yyyy-MM-dd")),
      metadata_modified_date: new Date(format(formData.metadata_modified_date, "yyyy-MM-dd")),
      registration_date: new Date(format(formData.registration_date, "yyyy-MM-dd")),
    };

    onNext(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl w-full mx-auto p-6 bg-white shadow-md rounded-lg overflow-y-auto h-fit"
    >
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        {[
          { id: "title", label: "Title *", value: formData.title },
          { id: "description", label: "Description *", value: formData.description },
          { id: "citation", label: "Citation *", value: formData.citation },
          { id: "doi", label: "Digital Object Identifier *", value: formData.doi },
          { id: "language", label: "Language *", value: formData.language },
          { id: "data_language", label: "Data Language *", value: formData.data_language },
          { id: "license", label: "License *", value: formData.license },
          { id: "keywords", label: "Keywords *", value: formData.keywords },
          { id: "dataset_type", label: "Dataset Type *", value: formData.dataset_type },
          { id: "category_id", label: "Category ID *", value: formData.category_id },
        ].map(({ id, label, value }) => (
          <div key={id} className="w-full sm:w-[48%] flex flex-col">
            <Label className="text-sm font-medium text-gray-700">
              {label.replace("*", "")} <span className="text-red-500">*</span>
            </Label>
            <Input id={id} name={id} value={value} onChange={handleChange} />
          </div>
        ))}

        {[ // Date Pickers
          { id: "publication_date", label: "Publication Date", value: formData.publication_date },
          { id: "metadata_modified_date", label: "Metadata Modified Date", value: formData.metadata_modified_date },
          { id: "registration_date", label: "Registration Date", value: formData.registration_date },
        ].map(({ id, label, value }) => (
          <div key={id} className="w-full sm:w-[48%] flex flex-col">
            <Label className="text-sm font-medium text-gray-700">{label} <span className="text-red-500">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("justify-start text-left font-normal")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(value, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value}
                  onSelect={(date) => handleDateChange(id as keyof InitialDatasetForm, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button type="submit" className="w-full sm:w-1/3" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Next"}
        </Button>
      </div>
    </form>
  );
};

export default InitialDatasetRegistration;
