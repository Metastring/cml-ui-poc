"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import useMapStore from "@/store/base_map_store/useMapStore";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import { useGetFilterData } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import { useGetMapSearchData } from "./useGetMapSearchData";
import useMapSearchData from "@/store/map_search_store/useMapSearchData";
import { toast } from "sonner";
import useMapSearchFilter from "@/store/map_search_store/useMapSearchFilter";
import TreeDropdown from "../ui/treedropdown";

interface MapSearchBarProps {
  onSearch?: () => void;
}

const MapSearchBar: React.FC<MapSearchBarProps> = ({ onSearch }) => {

  const { shapes } = useMapStore();
  const { categories, datasets, setCategories, setDatasets, resetFilters } =
    useMapSearchFilter();

  const { data, isLoading, isError } = useGetFilterData();

  const {
    mutate,
    isLoading: isMapDataLoading,
    clearDataMapSearchData,
  } = useGetMapSearchData();
  const { clearCoordinates } = useMapSearchData();

  const handleResetMapData = () => {
    clearCoordinates();
    clearDataMapSearchData();
    resetFilters();
  };

  const handleSearch = () => {
    if (categories.length === 0 && (!shapes || shapes.features.length === 0)) {
      toast.error(
        "Please select a category, datasets and draw at least one polygon."
      );
      return;
    }
    if (categories.length === 0) {
      toast.error("Please select a category.");
      return;
    }
    if (!datasets.length) {
      toast.error("Please select at least one dataset.");
      return;
    }
    if (!shapes || shapes.features.length === 0) {
      toast.error("Please draw at least one polygon.");
      return;
    }

    const polygon: FeatureCollection<Geometry, GeoJsonProperties> = shapes;

    mutate({
      category: categories[0],
      dataset: datasets.map((k) =>
        k === "Global Biodiversity Info Facility"
          ? "gbif"
          : k === "Kew Plant Database"
          ? "kew"
          : k
      ),
      // @ts-expect-error : polygonDetail type not declared
      shapes: polygon
        ? polygon.features.map((feature: GeoJSON.Feature) => ({
            geometry: feature.geometry,
          }))
        : [],
    });
    onSearch?.();
  };

const nodes = useMemo(() => {
  if (!data) return [];

  return data.map((category: {
    category_name: string;
    datasets?: {
      dataset_title: string;
      description?: string;
      metadata?: { label: string; value: string }[]
    }[]
  }, idx: number) => ({
    id: `n-${idx}`,
    name: category.category_name,
    children:
      category.datasets
        ?.filter(
          (ds) =>
            ds.dataset_title !== "Citizens’ Portal of Medicinal Plants"
        )
        .map((ds: {
          dataset_title: string;
          description?: string;
          metadata?: { label: string; value: string }[]
        }, jdx: number) => {
          const originalMetadata =
            ds.metadata?.map((m: { label: string; value: string }) => ({
              key: m.label,
              value: m.value,
            })) || [];

          return {
            id: `c-${idx}-${jdx}`,
            name: ds.dataset_title,
            description: ds.description || "No description",
            metadata: originalMetadata.length
              ? originalMetadata
              : [{ key: "Info", value: "No metadata" }],
          };
        }) || [],
  }));
}, [data]);


  return (
    <div className="flex flex-col space-y-3 w-fit p-4 rounded-xl bg-gray-50 shadow-lg">
      <TreeDropdown
        nodes={nodes}
        buttonLabel="Datasets"
        isLoading={isLoading}
        isError={isError}
        onChange={(selected) => {
          // Extract categories (parents)
          const selectedCategories = selected.map((item) => item.parent);

          // Extract datasets (children)
          const selectedDatasets = selected.flatMap((item) =>
            item.child.map((c) => c.name)
          );

          setCategories(selectedCategories);
          setDatasets(selectedDatasets);

          console.log("Selected Categories:", selectedCategories);
          console.log("Selected Datasets:", selectedDatasets);
        }}
      />
      <div className="flex space-x-2">
        <Button onClick={handleSearch} disabled={isLoading} className="flex-1">
          {isMapDataLoading ? "Searching..." : "Search"}
        </Button>
        <Button
          onClick={handleResetMapData}
          disabled={isLoading}
          className="w-fit bg-red-600 hover:bg-red-500"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default MapSearchBar;
