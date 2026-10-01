/* =========================================================
   SHARED LOOKUPS
   ========================================================= */

export interface Category {
  category_id: number | string;
  category_name: string;
}

export interface Publisher {
  publisher_name: string;
  record_count: number;
}

export interface Contact {
  name: string;
  role: string;
  email: string;
  organization: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Source {
  source_name: string;
  base_url?: string;
  description?: string;
}

/* =========================================================
   STEP 1 — DATASET & NODE
   POST /dataset-registration/draft
   PATCH /dataset-registration/{dataset_id}
   ========================================================= */

export interface DatasetNodeForm {
  node_name: string;
  node_maintained_by: string;
  title: string;
  category_id: string;
  publisher: string;
  contact_email: string;
  license: string;
  keywords: string;
  description: string;
}

export interface CreateDraftPayload {
  category: { category_id: string; category_name: string } | null;
  title: string;
  description?: string;
  citation?: string;
  doi?: string;
  language?: string;
  data_language?: string;
  license?: string;
  is_active?: boolean;
  keywords?: string;
  dataset_type?: string;
  node_name?: string;
  node_maintained_by?: string;
  publishers?: Publisher[];
  contacts?: Contact[];
  sources?: Source[];
  statistics?: { stat_name: string; stat_value: string }[];
}

export interface UpdateDraftPayload {
  title?: string;
  description?: string;
  citation?: string;
  doi?: string;
  language?: string;
  data_language?: string;
  license?: string;
  keywords?: string;
  dataset_type?: string;
  category_id?: string;
  node_name?: string;
  node_maintained_by?: string;
}

export interface DraftResponse {
  dataset_id: string;
  raw: Record<string, unknown>;
}

/* =========================================================
   STEP 2 — DATA REFERENCE
   POST /dataset-registration/{dataset_id}/reference/file (+ /verify)
   POST /dataset-registration/{dataset_id}/reference/url
   ========================================================= */

export type ReferenceType = "file" | "url" | "database" | "map-service";

export interface DataReferenceForm {
  reference_type: ReferenceType;
  /* file */
  reference_uri: string;
  file_format: string;
  access_credentials_ref: string;
  /* url */
  source_url: string;
  method: string;
  response_format: string;
  auth_header: string;
  /* database */
  connection_string: string;
  table_name: string;
  engine: string;
  /* map service */
  map_service_url: string;
  layer_type: string;
  layer_name: string;
}

export interface FileReferencePayload {
  reference_uri: string;
  file_format?: string | null;
  access_credentials_ref?: string | null;
}

export interface UrlReferencePayload {
  source_url: string;
  method?: string;
  auth_header?: string | null;
  response_format?: string;
}

export interface DatabaseReferencePayload {
  connection_string: string;
  table_name: string;
  engine?: string;
}

export interface MapServiceReferencePayload {
  map_service_url: string;
  layer_type?: string;
  layer_name: string;
}

export interface ReachabilityResult {
  reachable: boolean;
  columns_detected?: number;
  message?: string;
}

/* =========================================================
   STEP 3 — ONTOLOGY MAPPING
   POST /dataset-ontology-mapping/{dataset_id}/suggest
   POST /dataset-ontology-mapping/{dataset_id}/mappings
   ========================================================= */

/** One row of GET /dataset-ontology-mapping/ontologies — the mapping step's picker. */
export interface OntologyOption {
  graph_key: string;
  title: string;
}

export interface OntologyFieldOption {
  value: string;
  label: string;
  /** Ontology URI reported by the fields endpoint — pre-fills `ontology_uri`. */
  uri?: string;
  /** "datatype" (what a column maps to) or "object" (a relation between classes). */
  property_type?: string;
  /** Class the property is declared on. */
  class_name?: string;
  /** The term's own type, e.g. "xsd:double". */
  range?: string;
}

export interface SuggestedField {
  field_name: string;
  sample_value: string;
  suggested_term?: string;
  confidence?: number;
}

export interface MappingField {
  id: string;
  field_name: string;
  sample_value: string;
  /** Ontology field URI — sent as `ontology_field`. */
  ontology_term: string;
  /** Ontology URI of the selected term — sent as `ontology_uri`. */
  ontology_uri?: string;
  /** Observed range of the sampled values — sent as `value_range`. */
  value_range?: string;
  /** Extra mapping details — sent as `metadata`. */
  metadata?: Record<string, unknown>;
  /** Label for a field the user couldn't find in the ontology. */
  label?: string;
  /** Data type for a field the user couldn't find in the ontology. */
  data_type?: string;
  /** Term came from /suggest rather than from the user. */
  auto: boolean;
  /** Row was added by the user rather than detected in the source header. */
  added_manually: boolean;
}

export interface SaveMappingsPayload {
  ontology_graph_key: string;
  mappings: {
    field_name: string;
    /** Omitted for a field the user couldn't find in the ontology. */
    ontology_field?: string;
    ontology_uri?: string;
    sample_value?: string;
    value_range?: string;
    metadata?: Record<string, unknown>;
    /** Only sent with `ontology_uri` and no `ontology_field`. */
    label?: string;
    data_type?: string;
  }[];
}

/* =========================================================
   STEP 4 — REVIEW & PUBLISH
   GET  /dataset-registration/{dataset_id}/review-summary
   POST /dataset-registration/{dataset_id}/publish
   ========================================================= */

export interface PublishResult {
  status?: string;
  node_id?: string;
  dataset_id?: string;
  raw: Record<string, unknown>;
}

export interface PublishSummary {
  title: string;
  node_name: string;
  reference_type: string;
  data_location: string;
  category: string;
  fields_mapped: number;
  fields_total: number;
  manually_added: number;
  status: string;
}

/* =========================================================
   WIZARD
   ========================================================= */

export type RegistrationStep = 1 | 2 | 3 | 4;
