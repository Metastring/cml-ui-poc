"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFederatedSearchStore } from "@/store/federated_search_store/useFederatedSearchStore";
import { Combobox } from "@/components/ui/combobox";
import { MultiSelectCombobox } from "@/components/ui/MultiSelectCombobox";
import {
  useGetFilterData,
} from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import { UseMutateFunction } from "@tanstack/react-query";
import { toast } from "sonner";

interface Option {
  value: string;
  label: string;
}

type FederatedSearchVariables = {
  search_text: string;
  category: string[];
  dataset: string[];
  fields: string[];
};

type FederatedSearchBarProps = {
  mutate: UseMutateFunction<
    unknown, // API response type
    unknown, // Error type
    FederatedSearchVariables,
    unknown // Context type
  >;
};

const FederatedSearchBar: React.FC<FederatedSearchBarProps> = ({ mutate }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading, error } = useGetFilterData();
  const {

    datasets,
    categories,
    indicators,
    setQuery,
    setCategories,
    setDatasets,
    setIndicators,
  } = useFederatedSearchStore();

  const categoryList: Option[] = useMemo(() => {
    if (isLoading || error || !data) return [];
    return data.map((item: { category_name: string }) => ({
      value: item.category_name,
      label: item.category_name
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }));
  }, [data, isLoading, error]);

  const datasetList: Option[] = useMemo(() => {
    if (isLoading || error || !data) return [];
    return (
      data
        ?.find(
          (item: {
            category_name: string;
            datasets?: { dataset_title: string }[];
          }) => item.category_name === categories
        )
        ?.datasets?.map((ds) => ({
          label: ds.dataset_title,
          value: ds.dataset_title,
        })) ?? []
    );
  }, [data, categories, isLoading, error]);
  const indicatorList: Option[] = useMemo(() => {
    if (isLoading || error || !data) return [];

    // Find category
    const category = data.find(
      (item) =>
        (
          item as {
            category_name: string;
            datasets?: {
              dataset_title: string;
              fields: { ontology_mapping: string }[];
            }[];
          }
        ).category_name === categories
    ) as
      | {
          datasets?: {
            dataset_title: string;
            fields: { ontology_mapping: string }[];
          }[];
        }
      | undefined;

    if (!category?.datasets) return [];

    // Filter datasets by selected ones
    const filteredDatasets = category.datasets.filter((ds) =>
      datasets.includes(ds.dataset_title)
    );

    // Map to options & ensure uniqueness
    const uniqueOptions: Option[] = [];
    const seen = new Set<string>();

    filteredDatasets.forEach((ds) => {
      ds.fields.forEach((field) => {
        if (!seen.has(field.ontology_mapping)) {
          seen.add(field.ontology_mapping);
          uniqueOptions.push({
            label: field.ontology_mapping,
            value: field.ontology_mapping,
          });
        }
      });
    });

    return uniqueOptions;
  }, [data, categories, datasets, isLoading, error]);

  const handleSearch = () => {
    const inputValue = inputRef.current?.value.trim() || "";

     if (!categories.length) {
    toast.error("Please select a category.");
    return;
  }

  if (!datasets?.length) {
    toast.error("Please select a dataset.");
    return;
  }

  if (!indicators?.length) {
    toast.error("Please select at least one field.");
    return;
  }

  if (!inputValue?.trim()) {
    toast.error("Please enter a search term.");
    return;
  }

  // toast.success("All good! Fetching results...");

    console.log(inputValue);
    setQuery(inputValue);

    // Trigger mutation
    mutate({
      category: [categories],
      dataset: datasets,
      search_text: inputValue,
      fields: indicators,
    });
  };

  useEffect(() => {
    setDatasets([]);
    setIndicators([]);
  }, [categories, setDatasets, setIndicators]);

  useEffect(() => {
    setIndicators([]);
  }, [datasets, setIndicators]);

  return (
    <div className="flex flex-col mx-auto items-center justify-center space-y-2 rounded-2xl max-w-3xl w-full drop-shadow-lg p-6 bg-gray-50">
      {/* Filters Row */}
      <div className="flex flex-wrap justify-center gap-2 w-full  ">
        <Combobox
          options={categoryList}
          placeholder="Select category"
          onSelect={(val: string) => setCategories(val)}
          className="flex-1 min-w-0 w-full drop-shadow-md"
        />

        <MultiSelectCombobox
          options={datasetList}
          placeholder="Select Datasets"
          onChange={(val: string[]) => setDatasets(val)}
          className="flex-1 min-w-0 w-full drop-shadow-md"
          key={categories}
        />

        <MultiSelectCombobox
          options={indicatorList}
          placeholder="Select Fields"
          onChange={(val: string[]) => setIndicators(val)}
          className="flex-1 min-w-0 w-full drop-shadow-md"
          key={categories[0] + datasets.join(",")}
        />
      </div>

      {/* Search Box */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-2 w-full max-w-2xl">
        <Input
          ref={inputRef}
          type="text"
          placeholder="What's in your mind..."
          className="w-full sm:w-auto flex-1 p-2 bg-white drop-shadow-md"
        />
        <Button onClick={handleSearch} className="w-full sm:w-auto">
          Search
        </Button>
      </div>
    </div>
  );
};

export default FederatedSearchBar;
