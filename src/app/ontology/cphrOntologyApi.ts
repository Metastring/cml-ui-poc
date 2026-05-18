import type {
  OntologyClassDetail,
  OntologyClassesListResponse,
  OntologyFieldMapResponse,
  OntologyGraphResponse,
  OntologyPropertiesListResponse,
  OntologySearchResponse,
  OntologySummaryResponse,
} from "./cphrOntologyTypes";

/** Base URL for CPHR ontology HTTP API (`NEXT_PUBLIC_ONTOLOGY_BASE_URL`). */
export function getCphrOntologyBaseUrl(): string {
  return process.env.NEXT_PUBLIC_ONTOLOGY_BASE_URL!.trim();
}

function buildQuery(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, v);
  }
  const q = sp.toString();
  return q ? `?${q}` : "";
}

async function getJson<T>(pathWithQuery: string): Promise<T> {
  const url = `${getCphrOntologyBaseUrl()}${pathWithQuery}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Ontology API ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function fetchOntologySummary() {
  return getJson<OntologySummaryResponse>("/ontology/summary");
}

export function fetchOntologyClasses(group?: string) {
  const q = buildQuery({ group: group || undefined });
  return getJson<OntologyClassesListResponse>(`/ontology/classes${q}`);
}

export function fetchOntologyClassDetail(className: string) {
  const enc = encodeURIComponent(className);
  return getJson<OntologyClassDetail>(`/ontology/classes/${enc}`);
}

export function fetchOntologyProperties(filters: {
  property_type?: "object" | "datatype";
  class_name?: string;
}) {
  const q = buildQuery({
    property_type: filters.property_type,
    class_name: filters.class_name,
  });
  return getJson<OntologyPropertiesListResponse>(`/ontology/properties${q}`);
}

export function fetchOntologyGraph() {
  return getJson<OntologyGraphResponse>("/ontology/graph");
}

export function fetchOntologySearch(q: string) {
  const query = buildQuery({ q });
  return getJson<OntologySearchResponse>(`/ontology/search${query}`);
}

export function fetchOntologyFieldMap() {
  return getJson<OntologyFieldMapResponse>("/ontology/field-map");
}
