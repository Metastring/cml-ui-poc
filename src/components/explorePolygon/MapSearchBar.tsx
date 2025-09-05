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
// import { MultiSelectCombobox } from "../ui/MultiSelectCombobox";

interface MapSearchBarProps {
  onSearch?: () => void;
}
// interface Option {
//   value: string;
//   label: string;
// }
const MapSearchBar: React.FC<MapSearchBarProps> = ({ onSearch }) => {

  const { shapes } = useMapStore();
  const { categories, datasets, setCategories, setDatasets, resetFilters , setIndicators } = useMapSearchFilter();
  const { data, isLoading, isError } = useGetFilterData();
  const { mutate, isLoading: isMapDataLoading, clearDataMapSearchData} = useGetMapSearchData();
  const { clearCoordinates } = useMapSearchData();
  const handleResetMapData = () => {
    clearCoordinates();
    clearDataMapSearchData();
    resetFilters();
  };

  // const indicatorList: Option[] = useMemo(() => {
  //   if (isLoading || isError || !data) return [];

  //   const matchedCategories = data.filter((item) =>
  //     categories.includes(item.category_name)
  //   );

  //   const matchedDatasets = matchedCategories.flatMap(
  //     (cat) =>
  //       cat.datasets?.filter((ds) => datasets.includes(ds.dataset_title)) ?? []
  //   );

  //   const seen = new Set<string>();
  //   const options: Option[] = [];

  //   matchedDatasets.forEach((ds) => {
  //     // Inline TS fix: assert ds.fields is Field[]
  //     (
  //       ds.fields as
  //         | {
  //             ontology_mapping_to_display: string;
  //             ontology_mapping: string;
  //           }[]
  //         | undefined
  //     )?.forEach((field) => {
  //       if (!seen.has(field.ontology_mapping)) {
  //         seen.add(field.ontology_mapping);
  //         options.push({
  //           label: field.ontology_mapping_to_display,
  //           value: field.ontology_mapping,
  //         });
  //       }
  //     });
  //   });

  //   return options;
  // }, [data, categories, datasets, isLoading, isError]);





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
        category.datasets?.filter(
          (ds) =>
            ds.dataset_title !== "Citizens’ Portal of Medicinal Plants"
        )
        ?.map((ds, jdx) => {
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

  console.log(nodes)





  return (
    <div className="flex flex-col space-y-3 w-fit p-4 rounded-xl bg-gray-50 shadow-lg">
      <TreeDropdown
          nodes={nodes}
          buttonLabel="Datasets"
          isLoading={isLoading}
          isError={isError}
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

      {/* <MultiSelectCombobox
                options={indicatorList}
                placeholder="Attributes"
                value={indicators}
                onChange={(val: string[]) => setIndicators(val)}
                className="flex-1 min-w-0 w-full drop-shadow-md"
              /> */}

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
