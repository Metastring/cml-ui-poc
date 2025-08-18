"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Trash2 } from "lucide-react";
import useMapStore from "@/store/base_map_store/useMapStore";
import useIndicatorStore from "@/store/map_indicatore_store/useIndicatorStore";



const HHM_BASE_URL = process.env.NEXT_PUBLIC_HHM_BASE_URL

interface IndicatorItem {
  indicatorId: string;
  sourceId: string;
  opacity: number;
  visible: boolean;
  meta: unknown;
}

const ActiveIndicators = () => {
  const [open, setOpen] = useState(true);
  const { mapRef } = useMapStore();
  const { selectedSources } = useIndicatorStore();

  const [activeIndicators, setActiveIndicators] = useState<IndicatorItem[]>([]);

  useEffect(() => {
    const map = mapRef;
    if (!map) return;

    const flatSelected = Object.entries(selectedSources).flatMap(
      ([indicatorId, sources]) =>
        sources.map((sourceId) => `${indicatorId}__${sourceId}`)
    );

    const currentKeys = new Set(
      activeIndicators.map((item) => `${item.indicatorId}__${item.sourceId}`)
    );

    // 🔄 Add new indicators
    flatSelected.forEach(async (key) => {
      if (currentKeys.has(key)) return;

      const [indicatorId, sourceId] = key.split("__");

      try {
        const response = await fetch( HHM_BASE_URL+"/filters",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              terms: {
                "indicator.id": [indicatorId],
                "source.id": [sourceId],
              },
            }),
          }
        );

        const meta = await response.json();

        const newItem: IndicatorItem = {
          indicatorId,
          sourceId,
          opacity: 1,
          visible: true,
          meta,
        };

        setActiveIndicators((prev) => [newItem , ...prev]);
      } catch (error) {
        console.error(`Failed to fetch metadata for ${key}`, error);
      }
    });

    const selectedSet = new Set(flatSelected);
    const toRemove = activeIndicators.filter(
      (item) => !selectedSet.has(`${item.indicatorId}__${item.sourceId}`)
    );

    if (toRemove.length > 0) {
      toRemove.forEach((item) => {
        const layerId = `fills-${item.indicatorId}-${item.sourceId}`;
        const borderId = `borders-${item.indicatorId}-${item.sourceId}`;
        const sourceId = `source-${item.indicatorId}-${item.sourceId}`;

        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getLayer(borderId)) map.removeLayer(borderId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      });

      setActiveIndicators((prev) =>
        prev.filter((item) =>
          selectedSet.has(`${item.indicatorId}__${item.sourceId}`)
        )
      );
    }
  }, [selectedSources, mapRef, activeIndicators]);

  const handleOpacityChange = (index: number, value: number) => {
    const updated = [...activeIndicators];
    updated[index].opacity = value;
    setActiveIndicators(updated);

    const item = updated[index];
    const layerId = `fills-${item.indicatorId}-${item.sourceId}`;
    const map = mapRef;
    if (map?.getLayer(layerId)) {
      map.setPaintProperty(layerId, "fill-opacity", value);
    }
  };

  const handleToggleVisibility = (index: number) => {
  const updated = [...activeIndicators];
  const item = updated[index];
  item.visible = !item.visible;
  setActiveIndicators(updated);

  const fillLayerId = `fills-${item.indicatorId}-${item.sourceId}`;
  const borderLayerId = `borders-${item.indicatorId}-${item.sourceId}`;
  const map = mapRef;

  if (map?.getLayer(fillLayerId)) {
    map.setLayoutProperty(
      fillLayerId,
      "visibility",
      item.visible ? "visible" : "none"
    );
  }

  if (map?.getLayer(borderLayerId)) {
    map.setLayoutProperty(
      borderLayerId,
      "visibility",
      item.visible ? "visible" : "none"
    );
  }
};

  const handleRemove = (index: number) => {
    const item = activeIndicators[index];
    const map = mapRef;

    const layerId = `fills-${item.indicatorId}-${item.sourceId}`;
    const borderId = `borders-${item.indicatorId}-${item.sourceId}`;
    const sourceId = `source-${item.indicatorId}-${item.sourceId}`;

    if (map?.getLayer(layerId)) map.removeLayer(layerId);
    if (map?.getLayer(borderId)) map.removeLayer(borderId);
    if (map?.getSource(sourceId)) map.removeSource(sourceId);

    setActiveIndicators((prev) => prev.filter((_, i) => i !== index));

    // Also update selectedSources store
    const { setSelectedSources } = useIndicatorStore.getState();
    setSelectedSources((prev) => {
      const updated = { ...prev };
      updated[item.indicatorId] = updated[item.indicatorId]?.filter(
        (id) => id !== item.sourceId
      );
      if (updated[item.indicatorId]?.length === 0) {
        delete updated[item.indicatorId];
      }
      return updated;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="relative w-80 max-w-full bg-white shadow-lg border border-gray-200 rounded-lg p-4">
          <button
            onClick={() => setOpen(false)}
            className="absolute -top-5 -left-5 bg-white border border-gray-300 rounded-full p-1 shadow-md hover:bg-gray-100"
          >
            <ChevronDown size={18} />
          </button>

          <div className="max-h-60 overflow-y-auto pr-1 space-y-3">
            {activeIndicators.length === 0 ? (
              <p className="text-sm text-gray-600">No active indicators</p>
            ) : (
              activeIndicators.map((item, index) => (
                <div
                  key={`${item.indicatorId}__${item.sourceId}__${index}`}
                  className="p-2 bg-gray-100 rounded space-y-2"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {item.indicatorId}, Source: {item.sourceId}
                  </p>

                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handleToggleVisibility(index)}
                      className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                    >
                      {item.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>

                    <button
                      onClick={() => handleRemove(index)}
                      className="text-sm text-red-500 hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={item.opacity}
                      onChange={(e) =>
                        handleOpacityChange(index, parseFloat(e.target.value))
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-100"
        >
          <ChevronUp size={18} />
          <span className="text-sm font-medium">
            Indicators ({activeIndicators.length})
          </span>
        </button>
      )}
    </div>
  );
};

export default ActiveIndicators;
