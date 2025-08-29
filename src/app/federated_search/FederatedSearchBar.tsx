"use client";

import React, { useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFederatedSearchStore } from "@/store/federated_search_store/useFederatedSearchStore";
import { MultiSelectCombobox } from "@/components/ui/MultiSelectCombobox";
import { useGetFilterData } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import { UseMutateFunction } from "@tanstack/react-query";
import { toast } from "sonner";
import TreeDropdown from "@/components/ui/treedropdown";


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
    unknown,
    unknown,
    FederatedSearchVariables,
    unknown
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

  // Build indicator list based on selected category + dataset
  const indicatorList: Option[] = useMemo(() => {
    if (isLoading || error || !data) return [];

    const matchedCategories = data.filter((item) =>
      categories.includes(item.category_name)
    );

    const matchedDatasets = matchedCategories.flatMap(
      (cat) =>
        cat.datasets?.filter((ds) => datasets.includes(ds.dataset_title)) ?? []
    );

    const seen = new Set<string>();
    const options: Option[] = [];

    matchedDatasets.forEach((ds) => {
      // Inline TS fix: assert ds.fields is Field[]
      (
        ds.fields as
          | {
              ontology_mapping_to_display: string;
              ontology_mapping: string;
            }[]
          | undefined
      )?.forEach((field) => {
        if (!seen.has(field.ontology_mapping)) {
          seen.add(field.ontology_mapping);
          options.push({
            label: field.ontology_mapping_to_display,
            value: field.ontology_mapping,
          });
        }
      });
    });

    return options;
  }, [data, categories, datasets, isLoading, error]);

  // Handle search button click
  const handleSearch = () => {
    const inputValue: string = inputRef.current?.value.trim() ?? "";

    if (!categories.length) return toast.error("Please select a category.");
    if (!datasets.length) return toast.error("Please select a dataset.");
    if (!indicators.length)
      return toast.error("Please select at least one field.");
    if (!inputValue) return toast.error("Please enter a search term.");

    setQuery(inputValue);

    mutate({
      category: categories,
      dataset: datasets,
      search_text: inputValue,
      fields: indicators,
    });
  };

  // Build TreeDropdown nodes
  const nodes = useMemo(() => {
    if (!data) return [];

    type InlineMetadata = { key: string; value: string };
    type InlineChildNode = {
      id: string;
      name: string;
      description: string; // always string
      metadata: InlineMetadata[];
      fields: InlineChildNode[];
    };

    return data.map((category, idx) => ({
      id: `cat-${idx}`,
      name: category.category_name,
      children:
        category.datasets?.map((ds, jdx) => {
          // Convert object metadata to array of { key, value }
          const originalMetadata = ds.metadata
            ? Object.entries(ds.metadata)
                .filter(([k]) => k) // remove undefined keys
                .map(([key, value]) => ({
                  key,
                  value: value != null ? String(value) : "N/A",
                }))
            : [];

          return {
            id: `ds-${idx}-${jdx}`,
            name: ds.dataset_title,
            description: ds.description
              ? String(ds.description)
              : "No description", // fallback
            metadata: originalMetadata.length
              ? originalMetadata
              : [{ key: "Info", value: "No metadata" }],
            fields: (ds.fields ?? []) as InlineChildNode[],
          };
        }) ?? [],
    }));
  }, [data]);

  return (
    <div className="flex flex-col mx-auto items-center justify-center space-y-4 rounded-2xl max-w-3xl w-full drop-shadow-lg p-6 bg-gray-50">
      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-2 w-full">
        <TreeDropdown
          nodes={nodes}
          buttonLabel="Datasets"
          isLoading={isLoading}
          isError={!!error}
          onChange={(
            selected: { parent: string; child: { name: string }[] }[]
          ) => {
            if (!selected.length) {
              // Reset everything if nothing is selected
              setCategories([]);
              setDatasets([]);
              setIndicators([]);
              return;
            }

            const selectedCategories = Array.from(
              new Set(selected.map((item) => item.parent))
            );
            const selectedDatasets = selected.flatMap((item) =>
              item.child.map((c) => c.name)
            );

            setCategories(selectedCategories);
            setDatasets(selectedDatasets);

            // Also reset indicators because datasets changed
            setIndicators([]);

            console.log("TreeDropdown -> Categories:", selectedCategories);
            console.log("TreeDropdown -> Datasets:", selectedDatasets);
          }}
        />

        <MultiSelectCombobox
          options={indicatorList}
          placeholder="Fields"
          value={indicators}
          onChange={(val: string[]) => setIndicators(val)}
          className="flex-1 min-w-0 w-full drop-shadow-md"
        />
      </div>

      {/* Search */}
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
