"use client";

import React, { useEffect } from "react";
import useMapStore from "@/store/base_map_store/useMapStore";

interface WmsLayer {
  id: string;
  name?: string;
  wmsUrl: string; // base WMS URL
  opacity?: number;
}

interface AddLayerProps {
  layers: WmsLayer[];
}

const AddLayer: React.FC<AddLayerProps> = ({ layers }) => {
  const { mapRef } = useMapStore();

  useEffect(() => {
    if (!mapRef) return;

    const addedLayers: string[] = [];
    const dpr = window.devicePixelRatio || 1; // Device Pixel Ratio

    const addLayer = (layer: WmsLayer) => {
      if (!mapRef || mapRef.getSource(layer.id)) return;

      // Calculate high-res tile size
      const tileSize = 256 * dpr;

      // Use tiles with high-resolution WIDTH/HEIGHT
      const tiles = [
        `${layer.wmsUrl}&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=${layer.name}&SRS=EPSG:3857&WIDTH=${tileSize}&HEIGHT=${tileSize}&BBOX={bbox-epsg-3857}&FORMAT=image/png`
      ];

      mapRef.addSource(layer.id, {
        type: "raster",
        tiles,
        tileSize: 256, // keep 256 for MapLibre, tiles themselves are higher res
      });

      mapRef.addLayer({
        id: layer.id,
        type: "raster",
        source: layer.id,
        paint: {
          "raster-opacity": layer.opacity ?? 0.8,
        },
      });

      addedLayers.push(layer.id);
    };

    const handleAddLayers = () => {
      layers.forEach(addLayer);
    };

    if (mapRef.isStyleLoaded()) {
      handleAddLayers();
    } else {
      mapRef.once("load", handleAddLayers);
    }

    return () => {
      if (!mapRef) return; 
      addedLayers.forEach((layerId) => {
        try {
          if (mapRef.getLayer(layerId)) mapRef.removeLayer(layerId);
          if (mapRef.getSource(layerId)) mapRef.removeSource(layerId);
        } catch (err) {
          console.warn(`Failed to remove WMS layer ${layerId}`, err);
        }
      });
    };
  }, [mapRef, layers]);

  return null;
};

export default AddLayer;
