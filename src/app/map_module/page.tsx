"use client"

import  MapListIndex  from "@metastringfoundation/map-list";


export default function MapList() {
  return (
    <div className={`h-screen w-full relative`}>
      <MapListIndex
        loadToC={true}
        showToC={true}
        managePublishing={true}
        nakshaApiEndpoint={process.env.NEXT_PUBLIC_NAKSHA_ENDPOINT}
        // nakshaEndpointToken={process.env.NEXT_PUBLIC_NAKSHA_TOKEN}
        geoserver={{
          endpoint: process.env.NEXT_PUBLIC_GEOSERVER_ENDPOINT!,
          store: process.env.NEXT_PUBLIC_GEOSERVER_STORE!,
          workspace: process.env.NEXT_PUBLIC_GEOSERVER_WORKSPACE!,
        }}
        onLayerDownload={console.log}
        canLayerShare={true}
       
       
      />
    </div>
  );
}
