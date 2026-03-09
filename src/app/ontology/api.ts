"use client";

import { useQuery } from "@tanstack/react-query";
import type { OntologyTriplesResponse } from "./ontologyTriples";

/** One row from the ontology detail terms API (all/classes/properties tabs). */
export interface OntologyDetailItem {
  dataset_area: string;
  dataset_column: string;
  ontology_element_type: string;
  ontology_element: string;
  description: string;
}

/** API response shape for /{ontologyId}/ontology/{tab}. */
export interface OntologyTermsApiResponse {
  count: number;
  items: OntologyDetailItem[];
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

const ONTOLOGY_DETAIL_PATH = (ontologyId: string, tab: string) =>
  `/${ontologyId}/ontology/${tab}`;

export type OntologyDetailTab = "all" | "classes" | "properties";

/**
 * Fetches terms for the detail page from /{ontologyId}/ontology/{tab}.
 * Only biodiversity is supported; for other ontologies returns [] without calling.
 * Expects response shape: { count: number, items: OntologyDetailItem[] }.
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
  const url = `${BASE_URL}${ONTOLOGY_DETAIL_PATH(ontologyId, tab)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Ontology terms API error: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as OntologyTermsApiResponse;
  if (json == null || typeof json.count !== "number" || !Array.isArray(json.items)) {
    throw new Error("Invalid ontology terms response: expected { count, items }");
  }
  return json.items;
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
    queryKey: ["ontology-terms", ontologyId, tab],
    queryFn: () => fetchOntologyTerms(ontologyId, tab),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: shouldFetch,
  });

  return {
    terms: shouldFetch && query.data ? query.data : ([] as OntologyDetailItem[]),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

