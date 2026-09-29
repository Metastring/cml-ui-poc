/** Shared style tokens and display config for the Ontology Builder. */
import type { OntologyStatus } from "./apiTypes";

export const STATUS_CHIP: Record<
  OntologyStatus,
  { label: string; className: string; dot?: string; lock?: boolean }
> = {
  Staging: { label: "Draft", className: "bg-[#F4EEE2] text-[#8A6B3D]", dot: "#C08A3E" },
  Beta: { label: "Beta", className: "bg-[#E7EEF4] text-[#3D6180]", dot: "#5B8CB5" },
  Production: { label: "predefined", className: "bg-[#EDEDE7] text-[#6B6F66]", lock: true },
  Retired: { label: "Retired", className: "bg-[#EDEDE7] text-[#6B6F66]", dot: "#9A9E94" },
};

/** A predefined vocabulary has `status: null` — it has no builder record to hold one. */
export const PREDEFINED_CHIP = {
  label: "predefined",
  className: "bg-[#EDEDE7] text-[#6B6F66]",
  lock: true,
} as const;

export const inputClass =
  "w-full rounded border border-[#D8D9D0] bg-[#FBFBF7] px-3 py-2 text-sm outline-none focus:border-[#4A7C59]";
export const fieldLabelClass = "mb-1 block text-[13px] text-[#5C6058]";
export const linkButtonClass = "text-[13px] text-[#4A7C59] hover:text-[#2F5C42]";
export const paneHeaderClass =
  "flex h-[40px] shrink-0 items-center border-b border-[#E6E6DE] px-4 text-xs uppercase tracking-[0.09em] text-[#8A8E84]";
export const primaryButtonClass =
  "rounded bg-[#1E5B44] px-4 py-2 text-sm text-white hover:bg-[#194B39] disabled:opacity-50";
export const secondaryButtonClass =
  "rounded border border-[#D8D9D0] bg-white px-4 py-2 text-sm hover:bg-[#F7F8F4] disabled:opacity-50";
export const quietButtonClass = "text-sm text-[#6E7268] hover:text-[#26292A]";

/** One indent step in the class tree, in pixels. */
export const TREE_INDENT = 28;
