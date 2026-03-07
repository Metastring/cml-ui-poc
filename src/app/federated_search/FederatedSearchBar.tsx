"use client";
import React, { useMemo } from "react";
import { useFederatedSearchStore } from "@/store/federated_search_store/useFederatedSearchStore";
import { useGetFilterData } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import FederatedSearchTreeDropdown from "./FederatedSearchTreeDropdown";
import { FederatedSearchBarProps } from "@/types/app/federatedSearch.types";

export type SelectedShape = { parent: string; child: { name: string }[] }[];

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- mutate passed by parent for refetch API
const FederatedSearchBar: React.FC<FederatedSearchBarProps> = ({ mutate: _mutate }) => {
  const { data, isLoading, error } = useGetFilterData();
  const { categories, datasets, setCategories, setDatasets, setIndicators } = useFederatedSearchStore();

  // Derive selected tree shape from store so it stays in sync when categories/datasets are set from indicators
  const selectedNodes: SelectedShape = useMemo(() => {
    if (!data || !categories.length) return [];
    return categories
      .map((catName) => {
        const category = data.find((c) => c.category_name === catName);
        const categoryDatasets = category?.datasets ?? [];
        const selectedInCat = categoryDatasets
          .filter((ds) => datasets.includes(ds.dataset_title))
          .map((ds) => ({ name: ds.dataset_title }));
        if (selectedInCat.length === 0) return null;
        return { parent: catName, child: selectedInCat };
      })
      .filter((x): x is SelectedShape[number] => x != null);
  }, [data, categories, datasets]);

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
    <div className="flex flex-1 flex-col min-h-0 mx-auto items-center rounded-2xl max-w-3xl w-full drop-shadow-lg bg-muted/30">
      {/* Filters */}
      <div className="flex flex-1 flex-col min-h-0 w-full">
        <FederatedSearchTreeDropdown
        nodes={nodes}
        buttonLabel="Datasets"
        isLoading={isLoading}
        isError={!!error}
        selected={selectedNodes}
        onChange={(selected) => {
          if (!selected.length) {
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
          setIndicators([]);
        }}
        />
      </div>
    </div>
  );
};

export default FederatedSearchBar;
