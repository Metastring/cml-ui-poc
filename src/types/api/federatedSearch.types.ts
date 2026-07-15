//federatedSearch.types.ts


export interface Dataset {
  [x: string]: unknown;
  dataset_title: string;
}

export interface Category {
  category_name: string;
  datasets?: Dataset[];
}

export interface Contact {
  name: string | null;
  role: string | null;
  email: string | null;
  organization: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

export interface Publisher {
  publisher_name: string | null;
  country: string | null;
  record_count: number | null;
}

export interface Scope {
  temporal_start_date: string | null;
  temporal_end_date: string | null;
  geographic_scope: string | null;
  taxonomic_scope: string | null;
  taxonomic_authority: string | null;
}

export interface Field {
  field_name: string | null;
  ontology_mapping: string | null;
  ontology_mapping_to_display: string | null;
  data_type: string | null;
}

export interface Statistic {
  stat_name: string | null;
  stat_value: string | null;
  measurement_date: string | null;
}

export interface DatasetDetail {
  category_name: string;
  dataset_title: string;
  description: string | null;
  citation: string | null;
  doi: string | null;
  language: string | null;
  data_language: string | null;
  license: string | null;
  publication_date: string | null;
  last_updated: string | null;
  registration_date: string | null;
  is_active: boolean;
  keywords: string | null;
  dataset_type: string | null;
  contacts: Contact[];
  publishers: Publisher[];
  scopes: Scope[];
  fields: Field[];
  statistics: Statistic[];
}

export type DataItem = {
  decimalLatitude?: number;
  decimalLongitude?: number;
  taxon_name?: string;
  common_names?: string;
  scientific_name?: string;
  scientificName?: string;
  common_name?: string;
  basisOfRecord?: string;
  eventDate?: string;
  /** Dataset/source name (e.g. GBIF, iDigBio) when showing combined results */
  dataset?: string;
  /** When false, occurrence data is not available for this dataset; "Explore on map" is disabled. */
  is_occurrence_available?: boolean;
  /** Dynamic field keys returned by API (e.g. sanskrit_name, recipe, drug_name) */
  [key: string]: unknown;
};

export type PreFederatedSearchPayload = {
  search_text: string;
  category: string[];
  dataset: string[];
  fields: string[];
};

export type MatchedFieldsMap = {
  field: string;
  styleName?: string;
  styleTitle?: string;
  styleId?: number;
};

export type MatchedFields = {
  tabular: string[];
  map: MatchedFieldsMap[];
};

export type PreFederatedSearchDataset = {
  dataset_name: string;
  display_name?: string;
  available: boolean;
  count: number;
  matched_fields: MatchedFields;
  is_occurrence_available: boolean;
  dataset_geoserver_name?: string;
};

export type PreFederatedSearchDoneData = {
  search_text: string;
  total: number;
  cached: boolean;
};

export type PreFederatedSearchData = {
  search_text: string;
  datasets: PreFederatedSearchDataset[];
  total?: number;
  cached?: boolean;
  isComplete?: boolean;
  isStreaming?: boolean;
  hasError?: boolean;
  errorMessage?: string;
};

export type FederatedSearchData = {
  /** Ordered list of field names returned by API; drives table column order */
  fields?: string[];
  results?: Record<
    string,
    {
      field_results?: Record<
        string,
        {
          results?: DataItem[];
        }
      >;
      /** When false, this dataset has no occurrence data for map; "Explore on map" should be disabled. */
      is_occurrence_available?: boolean;
    }
  >;
};

export interface MapDataItem {
  latitude?: number | null;
  longitude?: number | null;
  scientificName: string;
  dataset?: string;
  eventDate?: string;
  basisOfRecord?: string;
}

export interface FederatedSearchDataItem {
  decimalLatitude?: number;
  decimalLongitude?: number;
  taxon_name?: string;
  common_names?: string;
  scientific_name?: string;
  common_name?: string;
}