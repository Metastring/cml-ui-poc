"use client";

import React, { useState } from "react";
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
import { toast } from "sonner";
import { useGetCategoriesList } from "@/api/contributeApiHandler/ContributeApiHandler";

import {
  Category,
  Contact,
  InitialDatasetForm,
  InitialDatasetRegistrationProps,
} from "@/types/app/contribute.types";

/* ================= COMPONENT ================= */

const InitialDatasetRegistration = ({
  onNext,
  isSubmitting = false,
}: InitialDatasetRegistrationProps) => {
  /* ---------- Categories ---------- */
  const { data: categoriesList = [] } = useGetCategoriesList() as {
    data: Category[];
  };

  const isLoading = false;

  /* ---------- Publisher ---------- */
  const [publisherName, setPublisherName] = useState("");

  /* ---------- Contacts ---------- */
  const [contacts, setContacts] = useState<Contact[]>([
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

  /* ---------- Main form ---------- */
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

    scopes: [
      {
        temporal_start_date: new Date(),
        temporal_end_date: new Date(),
        geographic_scope: "",
        taxonomic_scope: "",
        taxonomic_authority: "",
      },
    ],

    publishers: [],
    contacts: [],
    sources: [{ source_name: "", base_url: "", description: "" }],
    statistics: [
      { stat_name: "", stat_value: "", measurement_date: new Date() },
    ],
  });

  /* ================= HELPERS ================= */

  const updateArrayItem = <T, K extends keyof T>(
    arr: T[],
    index: number,
    key: K,
    value: T[K]
  ): T[] => {
    const copy = [...arr];
    copy[index] = { ...copy[index], [key]: value };
    return copy;
  };

  const addIfLastFilled = <T extends object>(
    arr: T[],
    emptyItem: T,
    label: string
  ): T[] | null => {
    const last = arr[arr.length - 1];
    const filled = Object.values(last).some((v) =>
      v instanceof Date ? true : String(v).trim()
    );

    if (!filled) {
      toast.error(`Please fill the previous ${label} first.`);
      return null;
    }

    return [...arr, emptyItem];
  };

  /* ================= FIELD MAPPING ================= */

  const fieldMapping: Record<string, keyof InitialDatasetForm> = {
    "Dataset Title": "title",
    "Dataset Type": "dataset_type",
    Description: "description",
    Citation: "citation",
    DOI: "doi",
    Language: "language",
    "Data Language": "data_language",
    License: "license",
    Keywords: "keywords",
  };

  /* ================= SUBMIT ================= */

  const selectedCategory = categoriesList.find(
    (c) => String(c.category_id) === formData.category_id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category_id) {
      toast.error("Category is required");
      return;
    }

    if (!publisherName.trim()) {
      toast.error("Publisher name is required");
      return;
    }

    const payload = {
      category: {
        category_id: String(formData.category_id),
        category_name: selectedCategory?.category_name ?? "",
      },
      title: formData.title,
      description: formData.description,
      citation: formData.citation,
      doi: formData.doi,
      language: formData.language,
      data_language: formData.data_language,
      license: formData.license,
      dataset_type: formData.dataset_type,
      is_active: true,
      keywords: formData.keywords,
      publishers: [
        {
          publisher_name: publisherName,
          record_count: "10",
        },
      ],
      contacts,
      sources: [],
      statistics: formData.statistics.map((stat) => ({
        stat_name: stat.stat_name,
        stat_value: stat.stat_value,
      })),
    };

    onNext(payload);
  };

  /* ================= RENDER ================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl w-full mx-auto p-6 bg-white shadow-md rounded-lg h-[80vh] overflow-y-auto"
    >
      <div className="flex flex-wrap gap-x-4 gap-y-4">
        <div className="flex flex-wrap gap-4 w-full">
          {/* CATEGORY */}
          <div className="w-full sm:w-[48%]">
            <Label className="pb-1">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(v) =>
                setFormData({ ...formData, category_id: v })
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesList.map((c) => (
                  <SelectItem
                    key={c.category_id}
                    value={String(c.category_id)}
                    className="pb-1"
                  >
                    {c.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* OTHER BASIC FIELDS */}
          {Object.entries(fieldMapping).map(([label, key]) => (
            <div key={key} className="w-full sm:w-[48%]">
              <Label className="pb-1">{label}</Label>
              <Input
                value={formData[key] as string}
                onChange={(e) =>
                  setFormData({ ...formData, [key]: e.target.value })
                }
              />
            </div>
          ))}
        </div>

        {/* PUBLISHER + CONTACTS */}
        <div className="w-full ">
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
              {(Object.keys(c) as (keyof Contact)[]).map((field) => (
                <Input
                  className="bg-white"
                  key={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={c[field]}
                  onChange={(e) =>
                    setContacts(
                      updateArrayItem(contacts, i, field, e.target.value)
                    )
                  }
                />
              ))}

              {contacts.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    setContacts(contacts.filter((_, idx) => idx !== i))
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
            onClick={() => {
              const next = addIfLastFilled(
                contacts,
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
                "contact"
              );
              if (next) setContacts(next);
            }}
          >
            + Add More
          </Button>
        </div>

        {/* SOURCES */}
        <div className="w-full">
          <Label className="font-semibold pb-1">Source</Label>
          {formData.sources.map((s, i) => (
            <div
              key={i}
              className="border p-3 rounded bg-gray-50 mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2"
            >
              <Input
                className="bg-white"
                placeholder="Source Name"
                value={s.source_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sources: updateArrayItem(
                      formData.sources,
                      i,
                      "source_name",
                      e.target.value
                    ),
                  })
                }
              />
              <Input
                className="bg-white"
                placeholder="Base URL"
                value={s.base_url}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sources: updateArrayItem(
                      formData.sources,
                      i,
                      "base_url",
                      e.target.value
                    ),
                  })
                }
              />
              <Input
                className="bg-white"
                placeholder="Description"
                value={s.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sources: updateArrayItem(
                      formData.sources,
                      i,
                      "description",
                      e.target.value
                    ),
                  })
                }
              />
              {formData.sources.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      sources: formData.sources.filter((_, idx) => idx !== i),
                    })
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
            onClick={() => {
              const next = addIfLastFilled(
                formData.sources,
                { source_name: "", base_url: "", description: "" },
                "source"
              );
              if (next) setFormData({ ...formData, sources: next });
            }}
          >
            + Add More
          </Button>
        </div>

        {/* STATISTICS */}
        <div className="w-full">
          <Label className="font-semibold pb-1">Statistic</Label>
          {formData.statistics.map((s, i) => (
            <div
              key={i}
              className="border p-3 rounded bg-gray-50 mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2"
            >
              <Input
                className="bg-white"
                placeholder="Stat Name"
                value={s.stat_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    statistics: updateArrayItem(
                      formData.statistics,
                      i,
                      "stat_name",
                      e.target.value
                    ),
                  })
                }
              />
              <Input
                className="bg-white"
                placeholder="Stat Value"
                type="text"
                min={0}
                value={s.stat_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    statistics: updateArrayItem(
                      formData.statistics,
                      i,
                      "stat_value",
                      e.target.value
                    ),
                  })
                }
              />
              {/* <Input
                type="number"
                placeholder="Record Count"
                // value={recordCount || ""}
                // onChange={(e) => setRecordCount(Number(e.target.value))}
                className="bg-white"
              /> */}

              {formData.statistics.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      statistics: formData.statistics.filter(
                        (_, idx) => idx !== i
                      ),
                    })
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
            onClick={() => {
              const next = addIfLastFilled(
                formData.statistics,
                {
                  stat_name: "",
                  stat_value: "",
                  measurement_date: new Date(),
                },
                "statistic"
              );
              if (next) setFormData({ ...formData, statistics: next });
            }}
          >
            + Add More
          </Button>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          type="submit"
          className="w-full sm:w-1/3"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Next"}
        </Button>
      </div>
    </form>
  );
};

export default InitialDatasetRegistration;
