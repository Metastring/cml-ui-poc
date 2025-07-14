
import React from 'react'
import SearchBar from "@/components/explorePolygon/SearchBar"
import PolygonDataTable from "@/components/explorePolygon/PolygonDataTable"
import InstructionPopover from '@/element/popover/InstructionPopover'

const ExplorePolygon = () => {

  return (
    <div className="w-full h-screen p-4 space-y-4">
      <InstructionPopover title="Explore Instructions">
         <p className="font-medium">How to Draw on the Map:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Select a shape: polygon, circle, rectangle, etc.</li>
          <li>Click to start drawing on the map.</li>
          <li>Draw the shape whatever you want.</li>
          <li>Use delete/trash buttons to delete shapes.</li>
          <li>Click download to save GeoJSON.</li>
        </ul>
      </InstructionPopover>
      <SearchBar />
      <PolygonDataTable  />
    </div>
  )
}

export default ExplorePolygon
