'use client'

import React, { useState } from 'react'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import useMapStore from '@/store/useMapStore'
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson'

// Define category option type
interface Option {
  value: string
  label: string
}

// Example category options
const options: Option[] = [
  { value: 'plant_species', label: 'Plant Species' },
  { value: 'soil_type', label: 'Soil Type' },
  { value: 'water_quality', label: 'Water Quality' },
  { value: 'forest_cover', label: 'Forest Cover' },
  { value: 'wetlands', label: 'Wetlands' },
  { value: 'protected_areas', label: 'Protected Areas' },
  { value: 'climate_zones', label: 'Climate Zones' },
  { value: 'vegetation_type', label: 'Vegetation Type' },
  { value: 'altitude_zone', label: 'Altitude Zone' },
]

const SearchBar: React.FC = () => {
  const { shapes } = useMapStore()

  const [category, setCategory] = useState<string>('')

  // Replace with actual API call logic
  // const postSearch = async () => {}
  const loading = false
  // const response = null
  // const isSuccess = false

  const handleSearch = () => {
    if (!shapes || shapes.features.length === 0 || !category) {
      alert('Please draw a polygon and select a category.')
      return
    }

    const polygon: FeatureCollection<Geometry, GeoJsonProperties> = shapes
    console.log('🟡 Selected Category:', category)
    console.log('🟢 Drawn Polygon:', polygon)

    alert('Frontend Flow is working fine, need backend integration!')
  }

  return (
    <div className="flex gap-4 max-w-lg">
      <Combobox
        options={options}
        placeholder="Select category"
        onSelect={(val: string) => setCategory(val)}
      />
      <Button onClick={handleSearch} disabled={loading} className="w-fit">
        {loading ? 'Searching...' : 'Search'}
      </Button>
    </div>
  )
}

export default SearchBar
