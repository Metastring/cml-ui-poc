"use client";

import React, { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { usePostDBMapping } from "@/api/admin/dbMappingApiHandler/DBMappingApiHandler";
import { toast } from "sonner";
import {  X } from "lucide-react";

const MappingForm = () => {
  const [formData, setFormData] = useState({
    category: "",
    dataset: "",
    base_url: "",
    participant_name: "",
    vernacular_name_common_names: "",
    taxon_scientific_name: "",
    family_name: "",
    habitat: "",
    medicinal_uses: "",
  });

  const [otherInput, setOtherInput] = useState("");
  const [otherItems, setOtherItems] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtherKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && otherInput.trim()) {
      e.preventDefault();
      if (!otherItems.includes(otherInput.trim())) {
        setOtherItems((prev) => [...prev, otherInput.trim()]);
        setOtherInput("");
      }
    }
  };

  const handleRemoveOtherItem = (item: string) => {
    setOtherItems((prev) => prev.filter((i) => i !== item));
  };

  const mutation = usePostDBMapping();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.participant_name.trim()) {
      toast("Participant Name is required");
      return;
    }

    try {
      await mutation.mutateAsync({
        endpoint: "/submit-mapping",
        params: {
          ...formData,
          other: otherItems.join(", "), // Send other items as comma-separated string
        },
      });

      alert("Form submitted successfully");

      setFormData({
        category: "",
        dataset: "",
        base_url: "",
        participant_name: "",
        vernacular_name_common_names: "",
        taxon_scientific_name: "",
        family_name: "",
        habitat: "",
        medicinal_uses: "",
      });

      setOtherItems([]);
      setOtherInput("");
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl w-full mx-auto p-6 bg-white shadow-md rounded-lg"
    >
      <div className="flex flex-wrap gap-4">
        {[
          {
            id: "category",
            label: "Category *",
            value: formData.category,
          },
          {
            id: "dataset",
            label: "Dataset *",
            value: formData.dataset,
          },
          {
            id: "base_url",
            label: "Base URL",
            value: formData.base_url,
          },
          {
            id: "participant_name",
            label: "Participant Name *",
            value: formData.participant_name,
          },
          {
            id: "vernacular_name_common_names",
            label: "Vernacular/Common Name",
            value: formData.vernacular_name_common_names,
          },
          {
            id: "taxon_scientific_name",
            label: "Scientific Name",
            value: formData.taxon_scientific_name,
          },
          {
            id: "family_name",
            label: "Family Name",
            value: formData.family_name,
          },
          {
            id: "habitat",
            label: "Habitat",
            value: formData.habitat,
          },
          {
            id: "medicinal_uses",
            label: "Medicinal Uses",
            value: formData.medicinal_uses,
          },
        ].map(({ id, label, value }) => (
          <div key={id} className="w-full sm:w-[48%] flex flex-col">
            {label.includes("*") ? (
              <Label className="text-sm font-medium text-gray-700">
                {label.replace("*", "")} <span className="text-red-500">*</span>
              </Label>
            ) : (
              <Label className="text-sm font-medium text-gray-700">
                {label}
              </Label>
            )}
            <Input id={id} name={id} value={value} onChange={handleChange} />
          </div>
        ))}

        {/* Other Field */}
        <div className="w-full sm:w-[48%] flex flex-col">
          <Label className="pb-1" htmlFor="other">
            Other (Press Enter to add)
          </Label>
          <Input
            id="other"
            value={otherInput}
            onChange={(e) => setOtherInput(e.target.value)}
            onKeyDown={handleOtherKeyDown}
            placeholder="Type and press Enter"
          />

          {otherItems.length > 0 && (
            <div className="flex flex-wrap mt-2 gap-2">
              {otherItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center space-x-1"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveOtherItem(item)}
                    className="text-red-500 hover:text-red-700 flexx items-center"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button type="submit" className="w-full sm:w-1/3">
          Submit
        </Button>
      </div>
    </form>
  );
};

export default MappingForm;
