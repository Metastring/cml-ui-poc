"use client";

import { useQuery } from "@tanstack/react-query";
import type { OntologyTriplesResponse } from "./ontologyTriples";

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
