import { redirect } from "next/navigation";

/**
 * Legacy per-ontology routes; CPHR explorer is unified at /ontology.
 */
export default async function OntologyLegacyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  redirect("/ontology");
}
