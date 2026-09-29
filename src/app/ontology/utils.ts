/** Pure display helpers — no state, no API. */
import type { OntologyListItem, PredefinedSummary } from "./apiTypes";

const count = (n: number) => n.toLocaleString();

export function relativeTime(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

/** "Ayurveda Ontology (AYU)" — used by the mappings list. Predefined entries have no acronym. */
export function ontologyLabel(ontologies: OntologyListItem[], key: string | null): string {
  const o = ontologies.find((x) => x.graph_key === key);
  if (!o) return key ?? "";
  return o.acronym ? `${o.title} (${o.acronym})` : o.title;
}

/** The rail shows "Herbal Formulation", not "Herbal Formulation Ontology". */
export const railTitle = (title: string) => title.replace(/ Ontology$/, "");

/**
 * Guide §5.4: an empty class tree is not a bug for a vocabulary-style ontology
 * (cf-standard-names, qudt-unit, skos). Their content is SKOS concepts or
 * individuals, so say what IS there instead of showing a blank pane.
 */
export function vocabularyHint(summary: PredefinedSummary | null): string | null {
  if (!summary || summary.class_count > 0) return null;
  const parts: string[] = [];
  if (summary.concept_count) parts.push(`${count(summary.concept_count)} concepts`);
  if (summary.individual_count) parts.push(`${count(summary.individual_count)} individuals`);
  if (!parts.length) return null;
  return `${parts.join(" · ")} — this vocabulary has no class hierarchy.`;
}

/** Header caption for a predefined ontology, which has no publish history. */
export function predefinedCaption(summary: PredefinedSummary): string {
  return `${count(summary.triple_count)} triples · ${count(summary.class_count)} classes`;
}

export const errorMessage = (e: unknown, fallback: string) =>
  e instanceof Error ? e.message : fallback;
