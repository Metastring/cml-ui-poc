"use client";

import { useQuery } from "@tanstack/react-query";
import type { OntologyTriplesResponse } from "./ontologyTriples";

/** One row from the ontology detail terms API (all/classes/properties tabs). */
export interface OntologyDetailItem {
  entity: string;
  label: string;
  type: string;
  description: string;
}

/** New backend response shape for /ontology/new-ontology-apis. */
export interface NewOntologyApisResponse {
  count: number;
  data: Array<{
    // New expected shape (preferred)
    ontology_class?: string;
    element_type?: string;
    parameter?: string;
    description?: string;

    // Backwards/alternate shape seen previously
    entity?: string;
    label?: string;
    type?: string;
  }>;
}

/** Backend response shape for /ontology/biodiversity-classes. */
export interface BiodiversityClassesResponse {
  count: number;
  classes: Array<{
    class_uri: string;
    local_name: string;
  }>;
}

/** Backend response shape for /ontology/biodiversity-datatype-properties. */
export interface BiodiversityDatatypePropertiesResponse {
  count: number;
  properties: Array<{
    property_uri: string;
    local_name: string;
  }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_FEDERATED_BASE_URL;

/** Backend response shape: { count, triples } */
export interface OntologyTriplesApiResponse {
  count: number;
  triples: OntologyTriplesResponse["triples"];
}

const ONTOLOGY_TRIPLES_PATH = "/ontology/triples";
const DEFAULT_LIMIT = 1000;

/**
 * Fetches ontology triples from the backend.
 * Returns { count, triples } or throws on non-OK response.
 */
export async function fetchOntologyTriples(
  limit: number = DEFAULT_LIMIT
): Promise<OntologyTriplesResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_FEDERATED_BASE_URL is not set");
  }
  const url = `${BASE_URL}${ONTOLOGY_TRIPLES_PATH}?limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Ontology API error: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as OntologyTriplesApiResponse;
  if (!json || typeof json.count !== "number" || !Array.isArray(json.triples)) {
    throw new Error("Invalid ontology triples response shape");
  }
  return {
    count: json.count,
    triples: json.triples,
  };
}

/**
 * React Query hook to fetch ontology triples from the backend.
 * Returns API data only; data is undefined while loading or on error.
 * @param limit - Max number of triples to request (default 1000)
 */
export function useOntologyTriples(limit: number = DEFAULT_LIMIT) {
  const query = useQuery({
    queryKey: ["ontology-triples", limit],
    queryFn: () => fetchOntologyTriples(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: Boolean(BASE_URL),
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/** Ontology id that has detail tab APIs; others show blank terms. */
export const ONTOLOGY_DETAIL_API_ID = "biodiversity" as const;

const NEW_ONTOLOGY_APIS_PATH = "/ontology/new-ontology-apis";
const BIODIVERSITY_CLASSES_PATH = "/ontology/biodiversity-classes";
const BIODIVERSITY_DATATYPE_PROPERTIES_PATH =
  "/ontology/biodiversity-datatype-properties";

export type OntologyDetailTab = "all" | "classes" | "properties";

/**
 * Fetches terms for the detail page from /ontology/new-ontology-apis.
 * Only biodiversity is supported; for other ontologies returns [] without calling.
 * Maps the new response into the existing `OntologyDetailItem` table shape so UI logic stays unchanged.
 */
export async function fetchOntologyTerms(
  ontologyId: string,
  tab: OntologyDetailTab
): Promise<OntologyDetailItem[]> {
  if (ontologyId !== ONTOLOGY_DETAIL_API_ID) {
    return [];
  }
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_FEDERATED_BASE_URL is not set");
  }
  // Classes tab has its own dedicated endpoint and UI (list), so this fetcher is
  // only for the table-driven tabs.
  if (tab === "classes" || tab === "properties") return [];
  const url = `${BASE_URL}${NEW_ONTOLOGY_APIS_PATH}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Ontology terms API error: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as NewOntologyApisResponse;
  if (json == null || typeof json.count !== "number" || !Array.isArray(json.data)) {
    throw new Error("Invalid ontology terms response: expected { count, data }");
  }

  const mapped: OntologyDetailItem[] = json.data.map((item) => {
    const entity = item.entity ?? item.ontology_class ?? "";
    const label = item.label ?? item.parameter ?? item.entity ?? item.ontology_class ?? "";
    const type = item.type ?? item.element_type ?? "";
    const description = item.description ?? "";

    return {
      entity,
      label,
      type,
      description,
    };
  });

  // "all" returns everything (Properties and Classes are handled by dedicated endpoints).
  return mapped;
}

export type OntologyClassItem = BiodiversityClassesResponse["classes"][number];
export type OntologyPropertyItem =
  BiodiversityDatatypePropertiesResponse["properties"][number];

/**
 * Fetches biodiversity classes from /ontology/biodiversity-classes.
 * Only biodiversity is supported; for other ontologies returns [] without calling.
 */
export async function fetchOntologyClasses(
  ontologyId: string
): Promise<OntologyClassItem[]> {
  if (ontologyId !== ONTOLOGY_DETAIL_API_ID) return [];
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_FEDERATED_BASE_URL is not set");
  }
  const url = `${BASE_URL}${BIODIVERSITY_CLASSES_PATH}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Ontology classes API error: ${res.status} ${res.statusText}`
    );
  }
  const json = (await res.json()) as BiodiversityClassesResponse;
  if (
    json == null ||
    typeof json.count !== "number" ||
    !Array.isArray(json.classes)
  ) {
    throw new Error(
      "Invalid ontology classes response: expected { count, classes }"
    );
  }
  return json.classes;
}

/**
 * Fetches biodiversity datatype properties from /ontology/biodiversity-datatype-properties.
 * Only biodiversity is supported; for other ontologies returns [] without calling.
 */
export async function fetchOntologyDatatypeProperties(
  ontologyId: string
): Promise<OntologyPropertyItem[]> {
  if (ontologyId !== ONTOLOGY_DETAIL_API_ID) return [];
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_FEDERATED_BASE_URL is not set");
  }
  const url = `${BASE_URL}${BIODIVERSITY_DATATYPE_PROPERTIES_PATH}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Ontology properties API error: ${res.status} ${res.statusText}`
    );
  }
  const json = (await res.json()) as BiodiversityDatatypePropertiesResponse;
  if (
    json == null ||
    typeof json.count !== "number" ||
    !Array.isArray(json.properties)
  ) {
    throw new Error(
      "Invalid ontology properties response: expected { count, properties }"
    );
  }
  return json.properties;
}

/**
 * Hook to fetch terms for the detail page by tab (all | classes | properties).
 * Only runs for biodiversity; for economy/metadata returns empty terms and does not fetch.
 */
export function useOntologyTermsByTab(
  ontologyId: string,
  tab: OntologyDetailTab
) {
  const shouldFetch =
    ontologyId === ONTOLOGY_DETAIL_API_ID && Boolean(BASE_URL);

  const query = useQuery({
    // Bump key to avoid serving cached data from the previous endpoint/shape.
    queryKey: ["ontology-terms-v2", ontologyId, tab],
    queryFn: () => fetchOntologyTerms(ontologyId, tab),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: shouldFetch && tab === "all",
  });

  return {
    terms: shouldFetch && query.data ? query.data : ([] as OntologyDetailItem[]),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch biodiversity classes for the Classes tab.
 */
export function useOntologyClasses(ontologyId: string) {
  const shouldFetch = ontologyId === ONTOLOGY_DETAIL_API_ID && Boolean(BASE_URL);
  const query = useQuery({
    queryKey: ["ontology-classes-v1", ontologyId],
    queryFn: () => fetchOntologyClasses(ontologyId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: shouldFetch,
  });

  return {
    classes: shouldFetch && query.data ? query.data : ([] as OntologyClassItem[]),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch biodiversity datatype properties for the Properties tab.
 */
export function useOntologyDatatypeProperties(ontologyId: string) {
  const shouldFetch = ontologyId === ONTOLOGY_DETAIL_API_ID && Boolean(BASE_URL);
  const query = useQuery({
    queryKey: ["ontology-datatype-properties-v1", ontologyId],
    queryFn: () => fetchOntologyDatatypeProperties(ontologyId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: shouldFetch,
  });

  return {
    properties:
      shouldFetch && query.data ? query.data : ([] as OntologyPropertyItem[]),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

