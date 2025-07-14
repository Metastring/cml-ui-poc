'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import useMapStore from '@/store/useMapStore';

const BaseMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  const { setMapRef } = useMapStore();

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
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
    <div className="w-full h-screen relative">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default BaseMap;
