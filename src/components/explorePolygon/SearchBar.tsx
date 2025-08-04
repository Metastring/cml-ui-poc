"use client";

import React, { useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import useMapStore from "@/store/useMapStore";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import { MultiSelectCombobox } from "../ui/MultiSelectCombobox";
import { useGetFilterData } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";

// Define category option type
interface Option {
  value: string;
  label: string;
}

const SearchBar: React.FC = () => {
  const { shapes } = useMapStore();
  const [category, setCategory] = useState<string>("");
  const [dataset, setDataset] = useState<string[]>([]);
  // console.log("category", category);
  // console.log("dataset", dataset);
  // console.log("shapes", shapes?.features);

  const { data } = useGetFilterData();


  // console.log(data);

  const categoryList = ((data ?? []) as { category: string }[]).map(
    (item): { value: string; label: string } => ({
      value: item.category,
      label: item.category
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    })
  );
  const datasetList: Option[] =
    data
      ?.find(
        (item: { category: string; datasets: { name: string }[] }) =>
          item.category === category
      )
      ?.datasets.map((ds: { name: string }) => ({
        label: ds.name,
        value: ds.name,
      })) ?? [];

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
    options={categoryList ?? []}
    placeholder="Select category"
    onSelect={(val: string) => setCategory(val)}
    className="w-[250px]"
  />
  <MultiSelectCombobox
    options={datasetList ?? []}
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
