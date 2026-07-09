"use client";
import React, { useMemo } from "react";
import { useFederatedSearchStore } from "@/store/federated_search_store/useFederatedSearchStore";
import { useGetFilterData } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import FederatedSearchTreeDropdown from "./FederatedSearchTreeDropdown";
import { FederatedSearchBarProps } from "@/types/app/federatedSearch.types";

export type SelectedShape = { parent: string; child: { name: string }[] }[];

const FederatedSearchBar: React.FC<FederatedSearchBarProps> = () => {
  const { data, isLoading, error } = useGetFilterData();
  const {
    categories,
    datasets,
    indicators,
    setCategories,
    setDatasets,
    setIndicators,
  } = useFederatedSearchStore();

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

  const nodes = useMemo(() => {
    if (!data) return [];

    type InlineMetadata = { key: string; value: string };
    type InlineChildNode = {
      id: string;
      name: string;
      description: string;
      metadata: InlineMetadata[];
      fields: InlineChildNode[];
    };

    return data.map((category, idx) => ({
      id: `cat-${idx}`,
      name: category.category_name,
      children:
        category.datasets?.map((ds, jdx) => {
          const originalMetadata = ds.metadata
            ? Object.entries(ds.metadata)
                .filter(([k]) => k)
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
              : "No description",
            metadata: originalMetadata.length
              ? originalMetadata
              : [{ key: "Info", value: "No metadata" }],
            fields: (ds.fields ?? []) as InlineChildNode[],
          };
        }) ?? [],
    }));
  }, [data]);

  const fieldToDatasets = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!data) return map;

    data.forEach((category) => {
      category.datasets?.forEach((ds) => {
        const dsTitle = ds.dataset_title;
        const fields = (ds as { fields?: { ontology_mapping: string }[] }).fields ?? [];
        fields.forEach((field) => {
          const value = field.ontology_mapping;
          if (!value) return;
          const existing = map.get(value) ?? [];
          if (!existing.includes(dsTitle)) {
            existing.push(dsTitle);
          }
          map.set(value, existing);
        });
      });
    });

    return map;
  }, [data]);

  return (
    <div className="flex flex-1 flex-col min-h-0 mx-auto items-center rounded-2xl max-w-3xl w-full drop-shadow-lg bg-muted/30">
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

            const dsSet = new Set(selectedDatasets);
            const nextIndicators = indicators.filter((indicator) => {
              const linkedDatasets = fieldToDatasets.get(indicator) ?? [];
              return linkedDatasets.some((dsTitle) => dsSet.has(dsTitle));
            });
            setIndicators(nextIndicators);
          }}
        />
      </div>
    </div>
  );
};

export default FederatedSearchBar;
