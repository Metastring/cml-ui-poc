"use client";

import React, { useMemo, useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import useMapStore from "@/store/useMapStore";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import { MultiSelectCombobox } from "../ui/MultiSelectCombobox";
import { useGetFilterData } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";

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
      (item: { category_name: string; datasets?: { dataset_title: string }[] }) =>
        item.category_name === category
    );
    return (
      categoryData?.datasets?.map((ds) => ({
        label: ds.dataset_title,
        value: ds.dataset_title,
      })) ?? []
    );
  }, [data, category, isLoading, error]);

  const loading = false;

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

    const polygon: FeatureCollection<Geometry, GeoJsonProperties> = shapes;
    console.log("🟡 Selected Category:", category);
    console.log("🔴 Selected dataset:", dataset);
    console.log("🟢 Drawn Polygon:", polygon?.features);

    alert("Frontend Flow is working fine, need backend integration!");
  };

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
      />
      <Button onClick={handleSearch} disabled={loading} className="w-full">
        {loading ? "Searching..." : "Search"}
      </Button>
    </div>
  );
};

export default SearchBar;
