'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import useMapStore from '@/store/base_map_store/useMapStore';

const BaseMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  const { setMapRef } = useMapStore();

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://unpkg.com/maplibre-gl-styles@0.0.1/styles/osm-mapnik/v8/india.json',
      center: [78.9629, 22.5937],
      zoom: 3.6,
    });

    mapRef.current = map;
    setMapRef(map);

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        // showUserHeading is NOT a valid property
      }),
      'top-right'
    );

    return () => {
      map.remove();
      mapRef.current = null;
      setMapRef(null);
    };
  }, [setMapRef]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default BaseMap;
