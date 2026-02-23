
export interface PolygonGeometry {
  type: "Polygon";
  coordinates: number[][][];
}

export interface PolygonDetail {
  geometry: PolygonGeometry;
}

export interface MapSearchParams {
  category: string;
  dataset: string[];
  shapes: PolygonDetail[];
  limit?: number;
  offset?: number;
}

// export type PolygonDataItem = Record<string, unknown>;

// src/types/api/mapSearch.types.ts

export interface PolygonDataItem {
  scientificName: string;
  scientific_name?: string;
  eventDate: string;
  basisOfRecord?: string;
  longitude: number;
  latitude: number;
  dataset: string;
  region?: string;
  family?: string;
  genus?: string;
  species?: string;
  author?: string;
  state?: string;
  continent?: string;
  countryCode?: string;
}

export interface FederatedSearchDataItem {
  decimalLatitude?: number;
  decimalLongitude?: number;
  taxon_name?: string;
  common_names?: string;
  scientific_name?: string;
  common_name?: string;
  eventDate?: string;
  basisOfRecord?: string;
}
