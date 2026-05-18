"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchOntologyClassDetail,
  fetchOntologyClasses,
  fetchOntologyFieldMap,
  fetchOntologyGraph,
  fetchOntologyProperties,
  fetchOntologySearch,
  fetchOntologySummary,
  getCphrOntologyBaseUrl,
} from "./cphrOntologyApi";

const STALE = 1000 * 60 * 5;

export function useOntologySummary(enabled: boolean) {
  return useQuery({
    queryKey: ["cphr-ontology", "summary"],
    queryFn: fetchOntologySummary,
    staleTime: STALE,
    retry: 1,
    enabled: enabled,
  });
}

export function useOntologyClassesList(group: string | "all", enabled: boolean) {
  const g = group === "all" ? undefined : group;
  return useQuery({
    queryKey: ["cphr-ontology", "classes", g ?? "all"],
    queryFn: () => fetchOntologyClasses(g),
    staleTime: STALE,
    retry: 1,
    enabled,
  });
}

export function useOntologyClassDetail(
  className: string | null,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["cphr-ontology", "class", className],
    queryFn: () => fetchOntologyClassDetail(className as string),
    staleTime: STALE,
    retry: 1,
    enabled: Boolean(className) && enabled,
  });
}

export function useOntologyPropertiesList(
  filters: { property_type?: "object" | "datatype"; class_name?: string },
  enabled: boolean
) {
  return useQuery({
    queryKey: ["cphr-ontology", "properties", filters],
    queryFn: () => fetchOntologyProperties(filters),
    staleTime: STALE,
    retry: 1,
    enabled,
  });
}

export function useOntologyGraph(enabled: boolean) {
  return useQuery({
    queryKey: ["cphr-ontology", "graph"],
    queryFn: fetchOntologyGraph,
    staleTime: STALE,
    retry: 1,
    enabled,
  });
}

export function useOntologyFieldMap(enabled: boolean) {
  return useQuery({
    queryKey: ["cphr-ontology", "field-map"],
    queryFn: fetchOntologyFieldMap,
    staleTime: STALE,
    retry: 1,
    enabled,
  });
}

export function useOntologySearch(q: string, enabled: boolean) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: ["cphr-ontology", "search", trimmed],
    queryFn: () => fetchOntologySearch(trimmed),
    staleTime: STALE,
    retry: 1,
    enabled: enabled && trimmed.length >= 2,
  });
}

export { getCphrOntologyBaseUrl };
