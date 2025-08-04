// 'use client'

// import React, { useEffect, useRef, useState } from 'react'
// import maplibregl from 'maplibre-gl'
// import 'maplibre-gl/dist/maplibre-gl.css'

// import rawState from '../../../public/india_state.json'

// const mapConfigs = [
//   { label: "Uttar Pradesh", center: [80.5, 22] },
//   { label: "Mahārāshtra", center: [80.5, 22] },
//   { label: "Tamil Nādu", center: [80.5, 22] },
//   { label: "West Bengal", center: [80.5, 22] },
//   { label: "Gujarāt", center: [80.5, 22] },
//   { label: "Assam", center: [80.5, 22] },
//   { label: "Chhattīsgarh", center: [80.5, 22] },
//   { label: "Karnātaka", center: [80.5, 22] },
// ];

// const MapSwitcher = () => {
//   const [selectedIndex, setSelectedIndex] = useState(0)
//   const [isGridView, setIsGridView] = useState(true)

//   const mapRefs = useRef<(HTMLDivElement | null)[]>([])
//   const mainMapRef = useRef<HTMLDivElement | null>(null)
//   const mainMapInstance = useRef<maplibregl.Map | null>(null)
//   const miniMapInstances = useRef<maplibregl.Map[]>([])

//   // Mini maps for grid or sidebar
//   useEffect(() => {
//     mapConfigs.forEach((config, index) => {
//       const container = mapRefs.current[index]
//       if (!container) return

//       const map = new maplibregl.Map({
//         container,
//         style: 'https://tiles.openfreemap.org/styles/liberty',
//         center: config.center,
//         zoom: 2,
//         interactive: false,
//         attributionControl: false,
//       })

//       miniMapInstances.current.push(map)

//       map.on('load', () => {
//         map.addSource('states', {
//           type: 'geojson',
//           data: rawState,
//         })

//         map.addLayer({
//           id: 'state-fill-mini-' + index,
//           type: 'fill',
//           source: 'states',
//           paint: {
//             'fill-color': [
//               'case',
//               ['==', ['get', 'shapeName'], config.label],
//               '#0d9488', // teal-700
//               '#d1d5db', // zinc-300
//             ],
//             'fill-opacity': 0.6,
//           },
//         })
//       })
//     })

//     return () => {
//       miniMapInstances.current.forEach((map) => map.remove())
//       miniMapInstances.current = []
//     }
//   }, [])

//   // Main map logic
//   useEffect(() => {
//     if (!mainMapRef.current) return

//     const config = mapConfigs[selectedIndex]

//     const map = new maplibregl.Map({
//       container: mainMapRef.current,
//       style: 'https://tiles.openfreemap.org/styles/liberty',
//       center: config.center,
//       zoom: 3,
//       attributionControl: false,
//     })

//     mainMapInstance.current = map

//     map.on('load', () => {
//       map.addSource('states', {
//         type: 'geojson',
//         data: rawState,
//       })

//       map.addLayer({
//         id: 'state-fill',
//         type: 'fill',
//         source: 'states',
//         paint: {
//           'fill-color': [
//             'case',
//             ['==', ['get', 'shapeName'], config.label],
//             '#0f766e', // teal-800
//             '#e2e8f0', // slate-200
//           ],
//           'fill-opacity': 0.6,
//         },
//       })

//       map.addLayer({
//         id: 'state-outline',
//         type: 'line',
//         source: 'states',
//         paint: {
//           'line-color': '#000',
//           'line-width': 1,
//         },
//       })
//     })

//     return () => {
//       map.remove()
//     }
//   }, [selectedIndex])

//   return (
//     <>
//       {isGridView ? (
//         // Initial 3-column grid view
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 h-[80vh] overflow-y-scroll">
//           {mapConfigs.map((config, index) => (
//             <div
//               key={index}
//               className="cursor-pointer border rounded p-2 hover:scale-[1.02] transition"
//               onClick={() => {
//                 setSelectedIndex(index)
//                 setIsGridView(false)
//               }}
//             >
//               <div
//                 ref={(el) => (mapRefs.current[index] = el)}
//                 className="h-[250px] w-full rounded bg-white"
//               />
//               <p className="text-sm text-center mt-2 font-medium">
//                 {config.label}
//               </p>
//             </div>
//           ))}
//         </div>
//       ) : (
//         // Detailed layout with sidebar + main map
//         <div className="flex h-[80vh]">
//           {/* Sidebar */}
//           <div className="w-[15%] overflow-y-auto p-2 bg-gray-100 border-r">
//             <div className="space-y-4">
//               {mapConfigs.map((config, index) => (
//                 <div
//                   key={index}
//                   className={`cursor-pointer transition hover:scale-[1.02] ${
//                     index === selectedIndex ? 'ring-2 ring-teal-500' : ''
//                   }`}
//                   onClick={() => setSelectedIndex(index)}
//                 >
//                   <div className="p-2">
//                     <div
//                       ref={(el) => (mapRefs.current[index] = el)}
//                       className="h-[100px] w-full rounded bg-white"
//                     />
//                   </div>
//                   <p className="text-sm text-center">{config.label}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Main Map */}
//           <div className="flex-1 relative">
//             <div ref={mainMapRef} className="h-[80vh] w-full" />
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

// export default MapSwitcher
