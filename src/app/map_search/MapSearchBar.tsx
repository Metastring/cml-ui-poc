"use client";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import useMapStore from "@/store/base_map_store/useMapStore";
import { useGetFilterData } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import useMapSearchData from "@/store/map_search_store/useMapSearchData";
import { toast } from "sonner";
import useMapSearchFilter from "@/store/map_search_store/useMapSearchFilter";
import TreeDropdown from "@/components/ui/treedropdown";
import { UseMutateFunction } from "@tanstack/react-query";
import {
  MapSearchParams,
  PolygonDataItem,
  PolygonDetail,
} from "@/types/api/mapSearch.types";

interface MapSearchBarProps {
  onSearch?: () => void;
  mutate: UseMutateFunction<PolygonDataItem[], Error, MapSearchParams, unknown>;
  clearDataMapSearchData: () => void;
  isMapDataLoading: boolean;
}

export type SelectedShape = { parent: string; child: { name: string }[] }[];

const MapSearchBar: React.FC<MapSearchBarProps> = ({
  onSearch,
  mutate,
  clearDataMapSearchData,
  isMapDataLoading,
}) => {
  const { shapes } = useMapStore();
  const {
    categories,
    datasets,
    setCategories,
    setDatasets,
    resetFilters,
    setIndicators,
  } = useMapSearchFilter();
  const { data, isLoading, isError } = useGetFilterData();
  const { clearCoordinates } = useMapSearchData();
  const [selectedNodes, setSelectedNodes] = useState<SelectedShape>([]);

  const handleResetMapData = () => {
    clearCoordinates();
    clearDataMapSearchData();
    resetFilters();
    setSelectedNodes([]);
  };

  const handleSearch = () => {
    if (categories.length === 0 && (!shapes || shapes.features.length === 0)) {
      toast.error(
        "Please select a datasets and draw at least one polygon."
      );
      return;
    }

    if (categories.length === 0) {
      toast.error("Please select a dataset.");
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

    const polygonShapes: PolygonDetail[] = shapes.features
      .filter(
        (f): f is GeoJSON.Feature<GeoJSON.Polygon> =>
          f.geometry.type === "Polygon"
      )
      .map((feature) => ({
        geometry: feature.geometry as PolygonDetail["geometry"],
      }));

    if (!polygonShapes.length) {
      toast.error("Please draw at least one polygon feature.");
      return;
    }

    mutate({
      category: categories[0],
      dataset: datasets.map((k) =>
        k === "Global Biodiversity Info Facility"
          ? "gbif"
          : k === "Kew Plant Database"
          ? "kew" 
          : k === "Citizens' Portal of Medicinal Plants" ? "cpmp" : k
      ),
      shapes: polygonShapes,
    });

    onSearch?.();
  };

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
        category.datasets
          ?.filter(
            (ds) => ds.dataset_title !== "Citizens’ Portal of Medicinal Plants"
          )
          .map((ds, jdx) => {
            const originalMetadata: InlineMetadata[] = ds.metadata
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

  return (
    <div className="flex flex-col space-y-3 w-fit p-4 rounded-xl bg-muted/30 shadow-lg">
      <TreeDropdown
        nodes={nodes}
        buttonLabel="Datasets"
        isLoading={isLoading}
        isError={isError}
        selected={selectedNodes}
        onChange={(selected) => {
          setSelectedNodes(selected);

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

      <div className="flex space-x-2">
        <Button onClick={handleSearch} disabled={isLoading} className="flex-1">
          {isMapDataLoading ? "Searching..." : "Search"}
        </Button>
        <Button
          onClick={handleResetMapData}
          disabled={isLoading}
          variant="destructive"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default MapSearchBar;
