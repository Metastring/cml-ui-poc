"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PublishSummary } from "@/types/app/contribute.types";
import { Badge, Btn, CheckIcon } from "./RegistrationUI";
import { Typography } from "@/components/ui/typography";

interface ReviewPublishStepProps {
  summary: PublishSummary;
  onRegisterAnother: () => void;
}

const SummaryRow = ({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) => (
  <div className="flex justify-between gap-6 border-b border-[#f0f0f0] px-4 py-[11px] text-compact last:border-b-0 dark:border-white/5">
    <Typography variant="inherit" as="span" tone="muted" weight="semibold">{label}</Typography>
    <span
      className={
        mono ? "text-right font-mono font-semibold" : "text-right font-bold"
      }
    >
      {children}
    </span>
  </div>
);

const ReviewPublishStep: React.FC<ReviewPublishStepProps> = ({
  summary,
  onRegisterAnother,
}) => {
  const router = useRouter();

  return (
    <div className="px-2.5 pb-2.5 pt-[30px] text-center">
      <div className="mx-auto mb-[18px] flex size-16 items-center justify-center rounded-full border border-[#bbf7d0] bg-[#f0fdf4] text-[#16a34a] dark:border-emerald-900 dark:bg-emerald-950/40">
        <CheckIcon size={30} strokeWidth={2.5} />
      </div>

      <Typography variant="h3" as="h2" tone="default" weight="bold" className="mb-2 text-xl">
        Dataset published successfully
      </Typography>
      <Typography variant="body" tone="muted" className="mx-auto mb-[22px] max-w-[480px] text-compact leading-[1.55]">
        &quot;{summary.title}&quot; is now in the CML catalog and searchable
        across the network. The data itself stays on your node — CML holds its
        metadata and this reference, marked pending reachability verification
        before it appears publicly.
      </Typography>

      <div className="mx-auto mb-[26px] max-w-[520px] overflow-hidden rounded-[12px] border border-border text-left">
        <SummaryRow label="Node">{summary.node_name || "—"}</SummaryRow>
        <SummaryRow label="Reference type">{summary.reference_type}</SummaryRow>
        <SummaryRow label="Data location" mono>
          {summary.data_location || "—"}
        </SummaryRow>
        <SummaryRow label="Data storage">
          Remains on source node — not copied to CML
        </SummaryRow>
        <SummaryRow label="Category">{summary.category || "—"}</SummaryRow>
        <SummaryRow label="Fields mapped">
          {summary.fields_mapped} of {summary.fields_total}
          {summary.manually_added > 0
            ? ` (${summary.manually_added} added manually)`
            : ""}
        </SummaryRow>
        <SummaryRow label="Status">
          <Badge tone="warn">{summary.status}</Badge>
        </SummaryRow>
      </div>

      <div className="flex flex-wrap justify-center gap-2.5">
        <Btn onClick={() => router.push("/datasets")}>View in catalog</Btn>
        <Btn onClick={onRegisterAnother}>Register another dataset</Btn>
        <Btn variant="primary" onClick={() => router.push("/")}>
          Go to dashboard
        </Btn>
      </div>
    </div>
  );
};

export default ReviewPublishStep;
