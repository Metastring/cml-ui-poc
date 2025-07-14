"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map, MapMouseEvent, MapGeoJSONFeature } from "maplibre-gl";
import { useIndicatorData } from "@/api/layerApiHandler/LayerApiHandler";
import useMapStore from "@/store/useMapStore";
import {
  FeatureCollection,
  Geometry,
  GeoJsonProperties,
} from "geojson";

import rawState from "../../../../public/india_state.json";
import rawDistrict from "../../../../public/india_district.json";

const indian_state = rawState as FeatureCollection<Geometry, GeoJsonProperties>;
const indian_district = rawDistrict as FeatureCollection<Geometry, GeoJsonProperties>;

interface SingleLayerRendererProps {
  indicatorId: string;
  sourceId: string;
}

interface IndicatorItem {
  ["entity.Name"]: string;
  value: string;
  [key: string]: string; // optional if there are more fields
}


const SingleLayerRenderer = ({ indicatorId, sourceId }: SingleLayerRendererProps) => {
  const { mapRef } = useMapStore();
  const popupRef = useRef(
    new maplibregl.Popup({ closeButton: false, closeOnClick: false })
  );

  const { data, isSuccess } = useIndicatorData({ indicatorId, sourceId });

  useEffect(() => {
    const map: Map | null = mapRef;
    if (!map || !data || !isSuccess) return;

    const popup = popupRef.current;

    const layerKey = `${indicatorId}-${sourceId}`;
    const fillLayerId = `fills-${layerKey}`;
    const borderLayerId = `borders-${layerKey}`;
    const sourceLayerId = `source-${layerKey}`;

    const isStateLevel = data[2]?.["entity.type"] === "STATE";
    const geojson = isStateLevel ? indian_state : indian_district;
    const nameKey = isStateLevel ? "shapeName" : "NAME_2";

    const dataMap: Record<string, number> = {};
    data.forEach((item: IndicatorItem) => {
      const name = item["entity.Name"]?.toLowerCase().trim();
      const value = parseFloat(item.value);
      if (name && !isNaN(value)) dataMap[name] = value;
    });

    const values = Object.values(dataMap);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const getColorForValue = (value: number | undefined): string => {
      if (value === undefined || isNaN(value)) return "#eee";
      const bucketCount = 6;
      const bucketSize = (maxValue - minValue) / bucketCount;
      const redShades = [
        "#ffe6e6",
        "#ff9999",
        "#ff6666",
        "#ff3333",
        "#e60000",
        "#990000",
      ];
      const bucketIndex = Math.min(
        Math.floor((value - minValue) / bucketSize),
        bucketCount - 1
      );
      return redShades[bucketIndex];
    };

    const coloredFeatures: FeatureCollection<Geometry, GeoJsonProperties> = {
      ...geojson,
      features: geojson.features.map((feature) => {
        const name = feature.properties?.[nameKey]?.toLowerCase().trim();
        const value = name ? dataMap[name] : undefined;
        const color = getColorForValue(value);
        return {
          ...feature,
          properties: {
            ...feature.properties,
            dataValue: value,
            fillColor: color,
          },
        };
      }),
    };

    if (!map.getSource(sourceLayerId)) {
      map.addSource(sourceLayerId, {
        type: "geojson",
        data: coloredFeatures,
        generateId: true,
      });
    }

    if (!map.getLayer(fillLayerId)) {
      map.addLayer({
        id: fillLayerId,
        type: "fill",
        source: sourceLayerId,
        paint: {
          "fill-color": ["get", "fillColor"],
          "fill-opacity": 0.7,
        },
      });
    }

    if (!map.getLayer(borderLayerId)) {
      map.addLayer({
        id: borderLayerId,
        type: "line",
        source: sourceLayerId,
        paint: {
          "line-color": "#000",
          "line-width": 0.5,
        },
      });
    }

    const handleMouseMove = (
      e: MapMouseEvent & { features?: MapGeoJSONFeature[] }
    ) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const name = feature.properties?.[nameKey];
      const value = feature.properties?.dataValue ?? "No Data";

      popup
        .setLngLat(e.lngLat)
        .setHTML(`<strong>${name}</strong><br/>Value: ${value}`)
        .addTo(map);
    };

    const handleMouseLeave = () => {
      popup.remove();
    };

    map.on("mousemove", fillLayerId, handleMouseMove);
    map.on("mouseleave", fillLayerId, handleMouseLeave);

    return () => {
      popup.remove();

      map.off("mousemove", fillLayerId, handleMouseMove);
      map.off("mouseleave", fillLayerId, handleMouseLeave);

      if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
      if (map.getLayer(borderLayerId)) map.removeLayer(borderLayerId);
      if (map.getSource(sourceLayerId)) map.removeSource(sourceLayerId);
    };
  }, [mapRef, data, isSuccess, indicatorId, sourceId]);

  return null;
};

export default SingleLayerRenderer;
