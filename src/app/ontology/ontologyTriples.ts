/**
 * Ontology triples: types and helpers for API response shape
 * (count + triples with graph, subject, predicate, object).
 */

export interface RdfNode {
  value: string;
  local_name: string;
  type: "uri" | "literal";
  datatype: string | null;
  lang: string | null;
}

export interface OntologyTriple {
  graph: RdfNode;
  subject: RdfNode;
  predicate: RdfNode;
  object: RdfNode;
}

export interface OntologyTriplesResponse {
  count: number;
  triples: OntologyTriple[];
}

/** Summary of one ontology for OLS-style list (derived from triples) */
export interface OntologySummary {
  id: string;
  title: string;
  description: string;
  numClasses: number;
  numProperties: number;
  graphIri: string;
}

const OWL_ONTOLOGY = "Ontology";
const OWL_CLASS = "Class";
const RDF_PROPERTY = "Property";
const RDFS_LABEL = "label";
const RDFS_COMMENT = "comment";

/** Derive ontology list from triples (group by graph, extract label/comment, count classes/properties). */
export function deriveOntologyListFromTriples(
  triples: OntologyTriple[]
): OntologySummary[] {
  const byGraph = new Map<
    string,
    {
      graphIri: string;
      labels: Map<string, string>;
      comments: Map<string, string>;
      ontologySubjects: Set<string>;
      classes: number;
      properties: number;
    }
  >();

  for (const t of triples) {
    const gId = t.graph.local_name;
    const gValue = t.graph.value;
    if (!byGraph.has(gId)) {
      byGraph.set(gId, {
        graphIri: gValue,
        labels: new Map(),
        comments: new Map(),
        ontologySubjects: new Set(),
        classes: 0,
        properties: 0,
      });
    }
    const rec = byGraph.get(gId)!;
    const sub = t.subject.value;
    const pred = t.predicate.local_name;
    const objVal =
      t.object.type === "literal" ? t.object.value : t.object.local_name;

    if (t.object.local_name === OWL_ONTOLOGY) {
      rec.ontologySubjects.add(sub);
    }
    if (pred === RDFS_LABEL && t.object.type === "literal") {
      rec.labels.set(sub, objVal);
    }
    if (pred === RDFS_COMMENT && t.object.type === "literal") {
      rec.comments.set(sub, objVal);
    }
    if (t.object.local_name === OWL_CLASS) {
      rec.classes += 1;
    }
    if (t.object.local_name === RDF_PROPERTY) {
      rec.properties += 1;
    }
  }

  const result: OntologySummary[] = [];
  for (const [id, rec] of byGraph.entries()) {
    let title = id;
    let description = "";
    for (const sub of rec.ontologySubjects) {
      const l = rec.labels.get(sub);
      const c = rec.comments.get(sub);
      if (l) title = l;
      if (c) description = c;
      break;
    }
    result.push({
      id,
      title,
      description,
      numClasses: rec.classes,
      numProperties: rec.properties,
      graphIri: rec.graphIri,
    });
  }
  return result.sort((a, b) => a.id.localeCompare(b.id));
}

/** Term (class or property) within an ontology for detail view (OLS-style) */
export interface OntologyTermInfo {
  id: string;
  label: string;
  comment: string;
  type: "Class" | "Property";
  /** Parent class IRI local name (from rdfs:subClassOf), if any */
  parentId?: string;
}

const RDFS_SUBCLASSOF = "subClassOf";

/** Get all classes and properties for one ontology (by graph id). */
export function getTermsForOntology(
  ontologyId: string,
  triples: OntologyTriple[]
): OntologyTermInfo[] {
  const labels = new Map<string, string>();
  const comments = new Map<string, string>();
  const termTypes = new Map<string, "Class" | "Property">();
  const parents = new Map<string, string>();

  for (const t of triples) {
    if (t.graph.local_name !== ontologyId) continue;
    const sub = t.subject.local_name;
    const pred = t.predicate.local_name;
    const objLit = t.object.type === "literal" ? t.object.value : null;

    if (pred === RDFS_LABEL && objLit != null) labels.set(sub, objLit);
    if (pred === RDFS_COMMENT && objLit != null) comments.set(sub, objLit);
    if (t.object.local_name === OWL_CLASS) termTypes.set(sub, "Class");
    if (t.object.local_name === RDF_PROPERTY) termTypes.set(sub, "Property");
    if (pred === RDFS_SUBCLASSOF && t.object.type === "uri")
      parents.set(sub, t.object.local_name);
  }

  return Array.from(termTypes.entries())
    .map(([id, type]) => ({
      id,
      label: labels.get(id) ?? id,
      comment: comments.get(id) ?? "",
      type,
      parentId: parents.get(id),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}
