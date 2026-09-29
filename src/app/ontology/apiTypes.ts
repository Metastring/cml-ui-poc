/**
 * Ontology Builder — API types, server-mirrored enums, and client-side helpers.
 *
 * Shapes match the "Ontology Builder API Map" (base path `/ontology/builder`).
 * The HTTP client that consumes them lives in `./api/ontologyApi`.
 */

export type Visibility = "Public" | "Private";
export type OntologyStatus = "Staging" | "Beta" | "Production" | "Retired";
export type PropertyType = "datatype" | "object";
export type MappingRelation =
  | "owl:equivalentClass"
  | "skos:exactMatch"
  | "skos:closeMatch"
  | "skos:relatedMatch";
export type MappingTargetKind = "internal" | "external_ontology" | "external_uri";

export interface Ontology {
  graph_key: string;
  title: string;
  acronym: string;
  visibility: Visibility;
  status: OntologyStatus;
  description: string;
  categories: string[];
  bibliographic_refs: string[];
  /** The API stores this as a free-text string, not a structured object. */
  contact: string | null;
  created_at: string;
  updated_at: string;
  last_published_at: string | null;
}

export type OntologySource = "predefined" | "custom";

/**
 * GET /dataset-ontology-mapping/ontologies — the only list that carries both
 * predefined vocabularies and the ontologies built here.
 */
export interface OntologyCatalogueItem {
  graph_key: string;
  title: string;
  source: OntologySource;
  /** null for predefined vocabularies — they have no builder record. */
  status: OntologyStatus | null;
}

/**
 * Rail item = the catalogue entry, merged with the builder record when the
 * ontology is a custom one. Predefined entries carry only the catalogue fields,
 * so everything the builder adds (acronym, publish dates, class_count) is optional.
 */
export interface OntologyListItem
  extends OntologyCatalogueItem,
    Partial<Omit<Ontology, "graph_key" | "title" | "status">> {
  class_count?: number;
}

export interface OntologyProperty {
  name: string;
  label: string;
  property_type: PropertyType;
  /** datatype → xsd type; object → class name in the SAME ontology */
  range_value: string;
  cardinality_note: string | null;
  domain_class_name: string;
}

export interface OntologyMapping {
  id: number;
  relation: MappingRelation;
  target_kind: MappingTargetKind;
  to_class_name: string | null;          // internal
  to_ontology_graph_key: string | null;  // external_ontology
  to_ref: string | null;                 // external_ontology (class name) | external_uri (CURIE/URI)
}

export interface OntologyClass {
  name: string;
  label: string;
  definition: string;
  synonyms: string[];
  parent_name: string | null;
  children: string[];
  has_children: boolean;
  datatype_properties: OntologyProperty[];
  object_properties: OntologyProperty[];
  mappings: OntologyMapping[];
}

export interface OntologyVersion {
  version_no: number;
  created_at: string;
  triple_count: number;
  class_count: number;
  note: string | null;
}

export interface OntologyVersionDetail extends OntologyVersion {
  ttl: string;
}

export interface ValidateResponse {
  valid: true;
  triple_count: number;
  class_count: number;
  object_property_count: number;
  datatype_property_count: number;
}

export interface PublishResponse {
  graph_key: string;
  saved_path: string;
  fuseki: { status: number; graph_uri: string; message: string };
  triple_count: number;
  class_count: number;
}

/* Request bodies */
export interface CreateOntologyBody {
  graph_key: string;
  title: string;
  acronym: string;
  visibility: Visibility;
  status: OntologyStatus;
  description?: string;
  categories?: string[];
  bibliographic_refs?: string[];
  contact?: string | null;
}
export type PatchOntologyBody = Partial<Omit<CreateOntologyBody, "graph_key">>;

export interface CreateClassBody {
  name: string;
  label: string;
  definition?: string;
  synonyms?: string[];
  parent_name: string | null;
}
export type PatchClassBody = Partial<Omit<CreateClassBody, "name">>;

export interface CreatePropertyBody {
  name: string;
  label: string;
  property_type: PropertyType;
  range_value: string;
  cardinality_note?: string | null;
}

export interface CreateMappingBody {
  relation: MappingRelation;
  target_kind: MappingTargetKind;
  to_class_name?: string;
  to_ontology_graph_key?: string;
  to_ref?: string;
}

/* ============================================================
 * Predefined ontologies — `/ontology/*` and `/ontology/v3/*`
 *
 * These are parsed from TTL files on the server and are read-only. They say the
 * same things as the builder shapes above under different names; the normalisers
 * in `./api/ontologyApi` translate them so the UI only ever sees one shape.
 * ========================================================== */

/** GET /ontology/summary — the card, and the only place concept/individual counts appear. */
export interface PredefinedSummary {
  graph_key: string;
  title: string;
  description: string;
  created: string | null;
  ontology_iri: string;
  module_count: number;
  triple_count: number;
  class_count: number;
  object_property_count: number;
  datatype_property_count: number;
  /** A vocabulary-style ontology has concepts/individuals and no classes. */
  concept_count: number;
  individual_count: number;
  deprecated_class_count: number;
  groups: Record<string, number>;
}

/** Note `domains`/`ranges` are lists here, where the builder has single values. */
export interface PredefinedProperty {
  name: string;
  iri: string;
  label: string;
  comment: string;
  property_type: PropertyType;
  domains: string[];
  ranges: string[];
  design_notes: string[];
}

/** GET /ontology/v3/classes — one tree level, lazily */
export interface PredefinedTreeClass {
  name: string;
  iri: string;
  label: string;
  comment: string;
  group: string;
  parents: string[];
  children: string[];
  has_children: boolean;
  datatype_properties: PredefinedProperty[];
  object_properties: PredefinedProperty[];
}

/** GET /ontology/classes/{class_name} — the detail panel's source for predefined */
export interface PredefinedClass {
  name: string;
  iri: string;
  label: string;
  comment: string;
  parents: string[];
  group: string;
  section_title: string | null;
  covered_fields: string[];
  descriptions: string[];
  design_notes: string[];
  children: string[];
  datatype_properties: PredefinedProperty[];
  /** Properties whose domain is this class. */
  outgoing_object_properties: PredefinedProperty[];
  /** Properties whose *range* is this class — they belong to other classes. */
  incoming_object_properties: PredefinedProperty[];
}

/** GET /ontology/search — substring match over names/labels/comments */
export interface OntologySearchResult {
  graph_key: string;
  query: string;
  class_count: number;
  property_count: number;
  classes: Omit<
    PredefinedClass,
    "children" | "datatype_properties" | "outgoing_object_properties" | "incoming_object_properties"
  >[];
  properties: PredefinedProperty[];
}

/* ============================================================
 * Enums (mirror server-side validation)
 * ========================================================== */

export const VISIBILITY_OPTIONS: Visibility[] = ["Public", "Private"];
export const STATUS_OPTIONS: OntologyStatus[] = ["Staging", "Beta", "Production", "Retired"];
export const PROPERTY_TYPES: PropertyType[] = ["datatype", "object"];
export const DATATYPE_RANGES = [
  "string", "integer", "boolean", "double", "decimal",
  "date", "dateTime", "anyURI", "float",
] as const;
export const MAPPING_RELATIONS: MappingRelation[] = [
  "owl:equivalentClass", "skos:exactMatch", "skos:closeMatch", "skos:relatedMatch",
];
export const MAPPING_TARGET_KINDS: MappingTargetKind[] = [
  "internal", "external_ontology", "external_uri",
];
export const GRAPH_KEY_PATTERN = /^[a-zA-Z0-9_-]+$/;
export const LOCAL_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/* ============================================================
 * Client-side helpers (not API calls)
 * ========================================================== */

/** Gap #1: live slug for the create modal. "Siddha Materia Medica" → "siddha_materia_medica" */
export const slugifyGraphKey = (title: string) =>
  title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

/** Local-name chip: "cphr:" + name (the API doesn't return the prefixed form). */
export const prefixedName = (name: string) => `cphr:${name}`;

/** Predefined class names are already CURIEs ("dcat:Dataset"); custom ones are bare. */
export const displayCurie = (name: string, source: OntologySource) =>
  source === "custom" ? prefixedName(name) : name;
