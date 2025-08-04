'use client';

import React from 'react';
// import BaseMap from '@/components/map/BaseMap';
// import PolygonEditor from '@/components/mapFeatures/polygonEditor/PolygonEditor';
// import ExternalLayers from '@/components/mapFeatures/externalLayers/ExternalLayers';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    // <div className="flex w-full h-screen transition-all duration-500">
    //   {/* Sidebar content area: dynamic per route */}
    //   <div className="max-w-1/2">
    //     {children}
    //   </div>

    //   {/* Map section (shared across views) */}
    //   <div className="w-full h-1/2">
    //     <BaseMap />
    //     <ExternalLayers />
    //     <PolygonEditor />
    //   </div>
    // </div>
    <>
    {children}
    </>
  );
};

export default Layout;
