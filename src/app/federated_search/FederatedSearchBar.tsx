"use client";

import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFederatedSearchStore } from "@/store/useFederatedSearchStore";
import { Combobox } from "@/components/ui/combobox";

interface Option {
  value: string;
  label: string;
}

const options: Option[] = [
  { value: "vernacular_name_common_names", label: "Vernacular Names" },
  { value: "plant_species", label: "Plant Species" },
  { value: "soil_type", label: "Soil Type" },
  { value: "water_quality", label: "Water Quality" },
  { value: "forest_cover", label: "Forest Cover" },
  { value: "wetlands", label: "Wetlands" },
  { value: "protected_areas", label: "Protected Areas" },
  { value: "climate_zones", label: "Climate Zones" },
  { value: "vegetation_type", label: "Vegetation Type" },
  { value: "altitude_zone", label: "Altitude Zone" },
];

const FederatedSearchBar = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    // categories,
     addCategory,
      // removeCategory,
      setQuery } =
    useFederatedSearchStore();

  const handleSearch = () => {
    const inputValue = inputRef.current?.value.trim() || "";
      setQuery(inputValue);
    }


  return (
    <div className="flex items-center gap-2 w-full">
      <Combobox
        options={options}
        placeholder="Select category"
        onSelect={(val: string) => addCategory(val)}
        className="w-[250px]"
      />

      <Input
        ref={inputRef}
        type="text"
        placeholder="Search for species, location, etc."
        className="w-full max-w-md bg-white"
      />

      <Button onClick={handleSearch}>Search</Button>
    </div>
  );
};

export default FederatedSearchBar;
