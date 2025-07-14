'use client';

import { useEffect, useRef } from 'react';
import { MaplibreTerradrawControl } from '@watergis/maplibre-gl-terradraw';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css';
import useMapStore from '@/store/useMapStore';
import { patchMapAddLayer } from '@/utils/mapUtils';
import type { FeatureCollection, Geometry, GeoJsonProperties, Feature } from 'geojson';

const PolygonEditor = () => {
  const { mapRef, setShapes, setTerraDrawInstance } = useMapStore();
  const drawRef = useRef<MaplibreTerradrawControl | null>(null);

  useEffect(() => {
    if (!mapRef || drawRef.current) return;

    // Add custom patch if needed
    patchMapAddLayer(mapRef);

    // Initialize TerraDraw control
    const draw = new MaplibreTerradrawControl({
      modes: [
        'render',
        'point',
        'linestring',
        'polygon',
        'rectangle',
        'circle',
        'freehand',
        'angled-rectangle',
        'sensor',
        'sector',
        'select',
        'delete-selection',
        'delete',
        'download',
      ],
      open: false,
    });

    drawRef.current = draw;
    mapRef.addControl(draw, 'top-left');

    const drawInstance = draw.getTerraDrawInstance();
    console.log('🟢 TerraDraw Instance:', drawInstance);

    if (drawInstance) {
      setTerraDrawInstance(drawInstance);

      drawInstance.on('finish', () => {
        const rawSnapshot = drawInstance.getSnapshot() as Feature<Geometry, GeoJsonProperties>[];

        const snapshot: FeatureCollection<Geometry, GeoJsonProperties> = {
          type: 'FeatureCollection',
          features: rawSnapshot,
        };

        console.log('🟡 Snapshot:', snapshot);
        setShapes(snapshot);
      });
    }

    // Cleanup
    return () => {
      if (mapRef && drawRef.current) {
        mapRef.removeControl(drawRef.current);
        drawRef.current = null;
      }
    };
  }, [mapRef, setShapes, setTerraDrawInstance]);

  return null;
};

export default PolygonEditor;
