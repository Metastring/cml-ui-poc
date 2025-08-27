"use client";

import React, { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import useMapStore from "@/store/base_map_store/useMapStore";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import { MultiSelectCombobox } from "@/components/ui/MultiSelectCombobox";
import { useGetFilterData } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import { useGetMapSearchData } from "./useGetMapSearchData";
import useMapSearchData from "@/store/map_search_store/useMapSearchData";
import { toast } from "sonner";
import useMapSearchFilter from "@/store/map_search_store/useMapSearchFilter";

interface Option {
  value: string;
  label: string;
}

const MapSearchBar: React.FC = () => {
  const { shapes } = useMapStore();
  const { categories, datasets, setCategories, setDatasets, resetFilters } =
    useMapSearchFilter();

  const { data, isLoading, error } = useGetFilterData();

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
    if (isLoading || error || !data || !categories) return [];
    const categoryData = data.find(
      (item: {
        category_name: string;
        datasets?: { dataset_title: string }[];
      }) => item.category_name === categories[0]
    );
    return (
      categoryData?.datasets
        ?.filter((ds) => ds.dataset_title !== "Citizens’ Portal of Medicinal Plants")
        .map((ds) => ({
          label: ds.dataset_title,
          value: ds.dataset_title,
        })) ?? []
    );
  }, [data, categories, isLoading, error]);

  const loading = false;

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
      // alert("Please select at least one dataset.");
      return;
    }
    if (!shapes || shapes.features.length === 0) {
      toast.error("Please draw at least one polygon.");
      // alert("Please draw at least one polygon.");
      return;
    }

    // clearCoordinates();

    const polygon: FeatureCollection<Geometry, GeoJsonProperties> = shapes;
    console.log("🟡 Selected Category:", categories);
    console.log("🔴 Selected dataset:", datasets);
    console.log("🟢 Drawn Polygon:", polygon?.features);

    mutate({
      category: categories[0],
      dataset: datasets.map(k => k === "Global Biodiversity Info Facility" ? "gbif" : k === "Kew Plant Database" ? "kew" : k),

      // @ts-expect-error : polygonDetail type not declared
      shapes: polygon
        ? polygon.features.map((feature: GeoJSON.Feature) => ({
            geometry: feature.geometry,
          }))
        : [],
    });
  };

  useEffect(() => {
    if (categories.length) {
      setDatasets([]);
    }
  }, [categories , setDatasets]);

  return (
    <div className="flex flex-col space-y-3 w-fit p-4 rounded-xl bg-gray-50 shadow-lg">
      <MultiSelectCombobox
        options={categoryList}
        placeholder="Select category"
        value={categories}
        onChange={(val: string[]) => setCategories(val)}
        className="w-[250px]"
      />
      <MultiSelectCombobox
        options={datasetList}
        placeholder="Select Datasets"
        value={datasets}
        onChange={(val: string[]) => setDatasets(val)}
        className="w-[250px]"
        key={categories[0]}
      />
      <div className="flex space-x-2">
        <Button onClick={handleSearch} disabled={loading} className="flex-1">
          {isMapDataLoading ? "Searching..." : "Search"}
        </Button>
        <Button
          onClick={handleResetMapData}
          disabled={loading}
          className="w-fit bg-red-600 hover:bg-red-500"
        >
          {"Reset"}
        </Button>
      </div>
    </div>
  );
};

export default MapSearchBar;
