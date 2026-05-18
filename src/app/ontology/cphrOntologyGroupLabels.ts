const GROUP_LABELS: Record<string, string> = {
  biodiversity: "Biodiversity",
  traditional_medicine:
    "Traditional medicine, substances & formulations",
  curation_support: "Curation support",
  extension: "Extensions",
  other: "Other",
};

export function formatOntologyGroup(key: string): string {
  return GROUP_LABELS[key] ?? key.replace(/_/g, " ");
}
