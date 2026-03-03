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

const contactFieldLabels: Record<keyof Contact, string> = {
  name: "Full name",
  role: "Role",
  email: "Email address",
  organization: "Organization",
  address: "Address",
  city: "City",
  state: "State / Province",
  country: "Country",
};

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
      className="w-full rounded-lg border border-border/60 bg-card p-6 shadow-sm"
    >
      <div className="mb-4 space-y-1">
        <h2 className="text-base font-semibold text-foreground">
          Step 1 — Dataset details
        </h2>
        <p className="text-xs text-muted-foreground">
          Tell us about the dataset and who maintains it. You can update these
          details later if needed.
        </p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-4">
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {/* CATEGORY */}
          <div className="w-full">
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
            <div key={key} className="w-full">
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
          <p className="mb-2 text-xs text-muted-foreground">
            Who is responsible for publishing or stewarding this dataset?
          </p>
          <Input
            placeholder="Publisher Name"
            value={publisherName}
            onChange={(e) => setPublisherName(e.target.value)}
            className="mb-2"
          />

          <Label className="pb-1">Publisher Contact</Label>
          <p className="mb-2 text-xs text-muted-foreground">
            Add one or more people we can reach if we have questions.
          </p>
          {contacts.map((c, i) => (
            <div
              key={i}
              className="mb-3 grid grid-cols-1 gap-2 rounded-md border border-border/60  p-3 sm:grid-cols-2"
            >
              {(Object.keys(c) as (keyof Contact)[]).map((field) => (
                <Input
                  key={field}
                  type={field === "email" ? "email" : "text"}
                  placeholder={contactFieldLabels[field]}
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
          <Label className="pb-1 font-semibold">Sources</Label>
          <p className="mb-2 text-xs text-muted-foreground">
            Where the dataset is hosted and how users can access more
            information.
          </p>
          {formData.sources.map((s, i) => (
            <div
              key={i}
              className="mb-3 grid grid-cols-1 gap-2 rounded-md border border-border/60  p-3 sm:grid-cols-3"
            >
              <Input
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
          <Label className="pb-1 font-semibold">Statistics</Label>
          <p className="mb-2 text-xs text-muted-foreground">
            High-level metrics that help users understand the dataset at a
            glance (for example, record counts or number of species).
          </p>
          {formData.statistics.map((s, i) => (
            <div
              key={i}
              className="mb-3 grid grid-cols-1 gap-2 rounded-md border border-border/60  p-3 sm:grid-cols-3"
            >
              <Input
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
