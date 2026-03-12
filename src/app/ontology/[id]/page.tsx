import React from "react";
import OntologyDetailView from "./OntologyDetailView";

/** Pre-declare known ontology IDs so the dynamic route is recognized (fixes 404). */
export function generateStaticParams() {
  return [
    { id: "biodiversity" },
    { id: "climate" },
    { id: "economy" },
    { id: "metadata" },
  ];
}

/** Allow other IDs to be resolved at request time. */
export const dynamicParams = true;

export default async function OntologyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ontologyId = decodeURIComponent(id);
  return <OntologyDetailView ontologyId={ontologyId} />;
}
