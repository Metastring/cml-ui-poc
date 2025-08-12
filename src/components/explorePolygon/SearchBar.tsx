"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import useMapStore from "@/store/useMapStore";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import { MultiSelectCombobox } from "@/components/ui/MultiSelectCombobox";
import { useGetFilterData } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import { useGetMapSearchData } from "./useGetMapSearchData";
import useMapSearchData from "@/store/useMapSearchData";

interface Option {
  value: string;
  label: string;
}

const SearchBar: React.FC = () => {
  const { shapes } = useMapStore();
  const [category, setCategory] = useState<string>("");
  const [dataset, setDataset] = useState<string[]>([]);

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
    if (isLoading || error || !data || !category) return [];
    const categoryData = data.find(
      (item: {
        category_name: string;
        datasets?: { dataset_title: string }[];
      }) => item.category_name === category
    );
    return (
      categoryData?.datasets?.map((ds) => ({
        label: ds.dataset_title,
        value: ds.dataset_title,
      })) ?? []
    );
  }, [data, category, isLoading, error]);

  const loading = false;

  const { mutate, isLoading: isMapDataLoading ,clearDataMapSearchData } = useGetMapSearchData();
  const { clearCoordinates } = useMapSearchData();

  const handleResetMapData = () => {
    clearCoordinates();
    clearDataMapSearchData();
  };
  const handleSearch = () => {
    if (!category && (!shapes || shapes.features.length === 0)) {
      alert("Please select a category and draw at least one polygon.");
      return;
    }
    if (!category) {
      alert("Please select a category.");
      return;
    }
    if (!shapes || shapes.features.length === 0) {
      alert("Please draw at least one polygon.");
      return;
    }

    // clearCoordinates();

    const polygon: FeatureCollection<Geometry, GeoJsonProperties> = shapes;
    console.log("🟡 Selected Category:", category);
    console.log("🔴 Selected dataset:", dataset);
    console.log("🟢 Drawn Polygon:", polygon?.features);

    mutate({
      category,
      dataset,
      // @ts-expect-error : polygonDetail type not declared
      shapes: polygon
        ? [
            {
              geometry: polygon.features[polygon.features.length - 1]
                .geometry as unknown,
            },
          ]
        : [],
    });
  };

  useEffect(() => {
    setDataset([]);
  }, [category]);

  return (
    <div className="flex flex-col space-y-3 w-fit p-4 rounded-xl bg-gray-50 shadow-lg">
      <Combobox
        options={categoryList}
        placeholder="Select category"
        onSelect={(val: string) => setCategory(val)}
        className="w-[250px]"
      />
      <MultiSelectCombobox
        options={datasetList}
        placeholder="Select Datasets"
        onChange={(val: string[]) => setDataset(val)}
        className="w-[250px]"
        key={category}
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

export default SearchBar;
