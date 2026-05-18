/** Types aligned with CPHR backend OpenAPI (/ontology/*). */

export type OntologyGroupKey =
  | "biodiversity"
  | "traditional_medicine"
  | "curation_support"
  | "extension"
  | "other"
  | (string & {});

export interface OntologySummaryResponse {
  title: string;
  description: string;
  created: string;
  class_count: number;
  object_property_count: number;
  datatype_property_count: number;
  groups: Partial<Record<OntologyGroupKey, number>>;
}

export interface OntologyClassListItem {
  name: string;
  label: string;
  comment: string;
  parents: string[];
  group: OntologyGroupKey;
  section_title: string;
  covered_fields: string[];
  descriptions: string[];
  design_notes: string[];
}

export interface OntologyClassesListResponse {
  count: number;
  items: OntologyClassListItem[];
}

export interface OntologyPropertyDef {
  name: string;
  label: string;
  comment?: string;
  property_type: "object" | "datatype" | string;
  domains: string[];
  ranges: string[];
  design_notes?: string[];
}

export interface OntologyClassDetail extends OntologyClassListItem {
  children: string[];
  datatype_properties: OntologyPropertyDef[];
  outgoing_object_properties: OntologyPropertyDef[];
  incoming_object_properties: OntologyPropertyDef[];
}

export interface OntologyPropertiesListResponse {
  count: number;
  items: OntologyPropertyDef[];
}

export interface OntologyGraphNode {
  id: string;
  label: string;
  group: OntologyGroupKey;
  type: string;
}

export interface OntologyGraphEdge {
  source: string;
  target: string;
  label: string;
  type: string;
}

export interface OntologyGraphResponse {
  nodes: OntologyGraphNode[];
  edges: OntologyGraphEdge[];
  unresolved_object_properties: OntologyPropertyDef[];
}

export interface OntologySearchHitClass {
  name: string;
  label: string;
}

export interface OntologySearchHitProperty {
  name: string;
  label: string;
}

export interface OntologySearchResponse {
  query: string;
  class_count: number;
  property_count: number;
  classes: OntologySearchHitClass[];
  properties: OntologySearchHitProperty[];
}

export interface FieldMapEntry {
  class_name: string;
  covered_fields: string[];
  description: string;
}

export interface FieldMapSection {
  title: string;
  group: OntologyGroupKey;
  entries: FieldMapEntry[];
}

export interface FieldMapClassIndexEntry {
  group: OntologyGroupKey;
  section_title: string;
  covered_fields: string[];
  descriptions: string[];
}

export interface OntologyFieldMapResponse {
  sections: FieldMapSection[];
  class_index: Record<string, FieldMapClassIndexEntry>;
}
