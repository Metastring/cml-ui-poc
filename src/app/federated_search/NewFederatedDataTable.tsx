"use client";

import React, { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import useFederatedMapData from "@/store/useFederatedMapData";

const data = [
  {
    scientificName: "Psidium guajava L.",
    decimalLatitude: 26.8399,
    decimalLongitude: 75.8221,
    eventDate: "2023-12-03 00:00:00",
    countryCode: "IN",
    basisOfRecord: "HUMAN_OBSERVATION",
  },
  {
    scientificName: "Mangifera indica L.",
    decimalLatitude: 28.6139,
    decimalLongitude: 77.209,
    eventDate: "2023-11-15 00:00:00",
    countryCode: "IN",
    basisOfRecord: "OBSERVATION",
  },
  {
    scientificName: "Azadirachta indica A. Juss.",
    decimalLatitude: 19.076,
    decimalLongitude: 72.8777,
    eventDate: "2023-10-22 00:00:00",
    countryCode: "IN",
    basisOfRecord: "FIELD_OBSERVATION",
  },
  {
    scientificName: "Ficus religiosa L.",
    decimalLatitude: 13.0827,
    decimalLongitude: 80.2707,
    eventDate: "2023-09-30 00:00:00",
    countryCode: "IN",
    basisOfRecord: "REMOTE_SENSING",
  },
  {
    scientificName: "Bambusa vulgaris Schrad. ex J.C.Wendl.",
    decimalLatitude: 22.5726,
    decimalLongitude: 88.3639,
    eventDate: "2023-08-18 00:00:00",
    countryCode: "IN",
    basisOfRecord: "SATELLITE_OBSERVATION",
  },
  {
    scientificName: "Ocimum tenuiflorum L.",
    decimalLatitude: 12.9716,
    decimalLongitude: 77.5946,
    eventDate: "2023-07-25 00:00:00",
    countryCode: "IN",
    basisOfRecord: "SENSOR_OBSERVATION",
  },
  {
    scientificName: "Curcuma longa L.",
    decimalLatitude: 23.0225,
    decimalLongitude: 72.5714,
    eventDate: "2023-06-14 00:00:00",
    countryCode: "IN",
    basisOfRecord: "HUMAN_OBSERVATION",
  },
  {
    scientificName: "Zingiber officinale Roscoe",
    decimalLatitude: 18.5204,
    decimalLongitude: 73.8567,
    eventDate: "2023-05-10 00:00:00",
    countryCode: "IN",
    basisOfRecord: "FIELD_OBSERVATION",
  },

  {
    scientificName: "Azadirachta indica A. Juss.",
    decimalLatitude: 19.076,
    decimalLongitude: 72.8777,
    eventDate: "2023-10-22 00:00:00",
    countryCode: "IN",
    basisOfRecord: "FIELD_OBSERVATION",
  },
  {
    scientificName: "Ficus religiosa L.",
    decimalLatitude: 13.0827,
    decimalLongitude: 80.2707,
    eventDate: "2023-09-30 00:00:00",
    countryCode: "IN",
    basisOfRecord: "REMOTE_SENSING",
  },
  {
    scientificName: "Bambusa vulgaris Schrad. ex J.C.Wendl.",
    decimalLatitude: 22.5726,
    decimalLongitude: 88.3639,
    eventDate: "2023-08-18 00:00:00",
    countryCode: "IN",
    basisOfRecord: "SATELLITE_OBSERVATION",
  },
  {
    scientificName: "Ocimum tenuiflorum L.",
    decimalLatitude: 12.9716,
    decimalLongitude: 77.5946,
    eventDate: "2023-07-25 00:00:00",
    countryCode: "IN",
    basisOfRecord: "SENSOR_OBSERVATION",
  },
  {
    scientificName: "Curcuma longa L.",
    decimalLatitude: 23.0225,
    decimalLongitude: 72.5714,
    eventDate: "2023-06-14 00:00:00",
    countryCode: "IN",
    basisOfRecord: "HUMAN_OBSERVATION",
  },
  {
    scientificName: "Zingiber officinale Roscoe",
    decimalLatitude: 18.5204,
    decimalLongitude: 73.8567,
    eventDate: "2023-05-10 00:00:00",
    countryCode: "IN",
    basisOfRecord: "FIELD_OBSERVATION",
  },
];

const NewFederatedDataTable = () => {
  const {
    setSelectedCoordinates,
    addVisibleMarker,
    removeVisibleMarker,

  } = useFederatedMapData();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [visibleRows, setVisibleRows] = useState<boolean[]>(
    new Array(data.length).fill(true)
  );

  useEffect(() => {
    // Add all markers on mount
    data.forEach((row) =>
      addVisibleMarker({
        lat: row.decimalLatitude,
        lng: row.decimalLongitude,
        label: row.scientificName,
      })
    );
  }, [addVisibleMarker]);

 const handleCheckboxChange = (index: number) => {
  const row = data[index];
  const { decimalLatitude: lat, decimalLongitude: lng, scientificName: label } = row;

  // Step 1: Toggle visibleRows state
  setVisibleRows((prev) => {
    const newVisibleRows = [...prev];
    newVisibleRows[index] = !prev[index];

    // Step 2: Count how many other rows with same lat/lng are still visible
    const hasOtherVisible = data.some((r, i) => {
      return (
        i !== index &&
        newVisibleRows[i] &&
        r.decimalLatitude === lat &&
        r.decimalLongitude === lng
      );
    });

    // Step 3: Add/remove marker conditionally
    if (prev[index]) {
      // Was visible, now hiding
      if (!hasOtherVisible) {
        removeVisibleMarker({ lat, lng, label });
      }
    } else {
      // Was hidden, now showing
      addVisibleMarker({ lat, lng, label });
    }

    return newVisibleRows;
  });
};


  const handleRowClick = (row: (typeof data)[number], index: number) => {
    setSelectedIndex(index);
    setSelectedCoordinates({
      lat: row.decimalLatitude,
      lng: row.decimalLongitude,
      label: row.scientificName,
    });
  };

  return (
    <div className="overflow-x-auto w-full">
      <div className="min-w-full bg-white shadow-xl rounded-xl overflow-hidden">
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-200 sticky top-0 z-10 text-xs uppercase font-semibold tracking-wider border">
            <tr>
              <th className="px-6 py-4">
                View on Map</th>
              <th className="px-6 py-4">Scientific Name</th>
              <th className="px-6 py-4">Event Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.map((row, index) => {
              const isSelected = selectedIndex === index;
              const isVisible = visibleRows[index];

              return (
                <tr
                  key={index}
                  className={`transition-colors duration-200 ${
                    isSelected
                      ? "bg-blue-100 text-blue-900"
                      : "hover:bg-blue-50"
                  }`}
                  onClick={() => handleRowClick(row, index)}
                >
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={isVisible}
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={() => handleCheckboxChange(index)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {row.scientificName}
                  </td>
                  <td className="px-6 py-4">{row.eventDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewFederatedDataTable;
