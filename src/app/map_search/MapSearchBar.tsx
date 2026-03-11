"use client";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import useMapStore from "@/store/base_map_store/useMapStore";
import { useGetFilterData } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import useMapSearchData from "@/store/map_search_store/useMapSearchData";
import { toast } from "sonner";
import useMapSearchFilter from "@/store/map_search_store/useMapSearchFilter";
import MapSearchTreeDropdown from "@/app/map_search/MapSearchTreeDropdown";
import { UseMutateFunction } from "@tanstack/react-query";
import {
  MapSearchParams,
  MapSearchResult,
  PolygonDetail,
} from "@/types/api/mapSearch.types";
import { Loader2, Search, RotateCcw } from "lucide-react";

interface MapSearchBarProps {
  onSearch?: () => void;
  mutate: UseMutateFunction<MapSearchResult, Error, MapSearchParams, unknown>;
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
    if (!datasets.length) {
      toast.error("Select at least one dataset to search.");
      return;
    }

    const polygonShapes: PolygonDetail[] =
      shapes && shapes.features.length > 0
        ? shapes.features
            .filter(
              (f): f is GeoJSON.Feature<GeoJSON.Polygon> =>
                f.geometry.type === "Polygon"
            )
            .map((feature) => ({
              geometry: feature.geometry as PolygonDetail["geometry"],
            }))
        : [];

    mutate({
      category: categories[0],
      dataset: datasets.map((k) =>
        k === "Global Biodiversity Info Facility"
          ? "gbif"
          : k === "Kew Plant Database"
          ? "kew"
          : k === "CPMP Botanical Source"
          ? "cpmp"
          : k
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

  const canSearch = datasets.length > 0;

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4 w-full">
      <div className="shrink-0 flex gap-2 px-3 pt-3">
        <Button
          onClick={handleSearch}
          disabled={isLoading || isMapDataLoading || !canSearch}
          size="sm"
          className="flex-1 gap-1.5 h-8 text-xs font-medium"
        >
          {isMapDataLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              Searching…
            </>
          ) : (
            <>
              <Search className="h-3.5 w-3.5 shrink-0" />
              Search
            </>
          )}
        </Button>
        <Button
          onClick={handleResetMapData}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 shrink-0 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <MapSearchTreeDropdown
          nodes={nodes}
          buttonLabel="Select datasets"
          isLoading={isLoading}
          isError={isError}
          selected={selectedNodes}
          onChange={(selected) => {
            setSelectedNodes(selected);
            // When datasets change, immediately clear existing markers + cached results
            clearCoordinates();
            clearDataMapSearchData();

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

      {datasets.length > 0 && (
        <div className="shrink-0 rounded-md border border-border bg-muted/50 px-2.5 py-2">
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Optional:</span> Draw a region on the map to filter by area, then click Search.
          </p>
        </div>
      )}
    </div>
  );
};

export default MapSearchBar;
