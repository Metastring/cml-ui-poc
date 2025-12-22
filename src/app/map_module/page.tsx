"use client"

import  MapListIndex  from "@metastringfoundation/map-list";


export default function MapList() {
  return (
    <div className={`h-screen w-screen relative`}>
      <MapListIndex
        loadToC={true}
        showToC={true}
        managePublishing={true}
        nakshaApiEndpoint={process.env.NEXT_PUBLIC_NAKSHA_BASE_URL}
        // nakshaEndpointToken={process.env.NEXT_PUBLIC_NAKSHA_TOKEN}
        geoserver={{
          endpoint: process.env.NEXT_PUBLIC_GEOSERVER_BASE_URL ?? "",
          store: "map",
          workspace: "metastring",
        }}
        onLayerDownload={console.log}
        canLayerShare={true}
        markers={[
          {
            latitude: 23.241346,
            longitude: 78.046875,
            colorHex: "07BEF1",
          },
        ]}
       
      />
    </div>
  );
}
