/** UI-local shapes derived from the API types. */
import type {
  OntologyClass,
  OntologyProperty,
  OntologySource,
  MappingRelation,
  MappingTargetKind,
} from "./apiTypes";

export type TabId = "details" | "properties" | "mappings";
export type BuilderAction = "validate" | "version" | "publish";

export type TreeNode = OntologyClass & { depth: number };

/** The class tree is flattened to rows so the list renders in one pass. */
export type TreeRow =
  | { kind: "class"; depth: number; node: TreeNode }
  | { kind: "add"; parent: string; depth: number };

/** A property tagged with the ancestor it came from (null = declared here). */
export type TaggedProperty = OntologyProperty & { inherited_from: string | null };

export type ClassDetail = Omit<OntologyClass, "datatype_properties" | "object_properties"> & {
  datatype_properties: TaggedProperty[];
  object_properties: TaggedProperty[];
  source: OntologySource;
  /** Chip text: "cphr:Plant" for a draft, "dcat:Dataset" for a predefined class. */
  curie: string;
  parent_curie: string | null;
  /** Predefined classes carry their IRI; a draft has none until it is published. */
  iri?: string;
};

/** A hit from `/ontology/search` — only what the tree needs to show it. */
export interface ClassSearchHit {
  name: string;
  label: string;
}

export interface PropertyFormState {
  kind: "datatype" | "object";
  name: string;
  range: string;
  cardinality: string;
}

export interface MappingFormState {
  relation: MappingRelation;
  target_kind: MappingTargetKind;
  to_class_name: string;
  to_ontology_graph_key: string;
  to_ref: string;
}
