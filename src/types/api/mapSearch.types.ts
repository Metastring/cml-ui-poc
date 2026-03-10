
export interface PolygonGeometry {
  type: "Polygon";
  coordinates: number[][][];
}

export interface PolygonDetail {
  geometry: PolygonGeometry;
}

export interface MapSearchParams {
  category?: string;
  dataset: string[];
  shapes?: PolygonDetail[];
  limit?: number;
  offset?: number;
}

/** API response per dataset: display_fields + data rows */
export interface DatasetDisplayResult {
  display_fields: string[];
  data: Record<string, unknown>[];
}

/** getMultiPolygonDataWithDisplayFields.results shape (keyed by dataset) */
export type MultiPolygonDisplayResults = Record<string, DatasetDisplayResult>;

/** Cached map search result: flattened rows + columns to show */
export interface MapSearchResult {
  rows: PolygonDataItem[];
  displayFields: string[];
}

/** Row item with known map fields + any display field keys from API */
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
  /** Allow display field keys from API (e.g. scientificname, eventdate) */
  [key: string]: string | number | undefined;
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
