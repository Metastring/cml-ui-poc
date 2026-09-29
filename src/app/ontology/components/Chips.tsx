import React from "react";
import { Lock } from "lucide-react";
import { PREDEFINED_CHIP, STATUS_CHIP } from "../constants";
import type { OntologyStatus } from "../apiTypes";

/** `null` means a predefined vocabulary, which carries no builder status. */
export function StatusChip({ status }: { status: OntologyStatus | null }) {
  const s = status ? STATUS_CHIP[status] : PREDEFINED_CHIP;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs leading-none ${s.className}`}>
      {s.lock ? (
        <Lock size={11} strokeWidth={2} />
      ) : (
        <span className="h-[6px] w-[6px] rounded-full" style={{ backgroundColor: s.dot }} />
      )}
      {s.label}
    </span>
  );
}

export function MonoChip({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-1 font-mono text-xs leading-none ${
        strong ? "bg-[#DDE9DE] font-semibold text-[#24503A]" : "bg-[#E4EDE5] text-[#2F5C42]"
      }`}
    >
      {children}
    </span>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-xs uppercase tracking-[0.09em] text-[#8A8E84]">{title}</h3>
      {action}
    </div>
  );
}
