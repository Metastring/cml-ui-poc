"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* =========================================================
   Primitives mirroring the v2 registration mockups (html/style.css)
   ========================================================= */

/** .card-head */
export const CardHead = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-[18px]">
    <h2 className="mb-1 text-[16px] font-bold text-foreground">{title}</h2>
    <p className="m-0 max-w-[640px] text-[12.5px] leading-[1.5] text-muted-foreground">
      {children}
    </p>
  </div>
);

/** .section-label */
export const SectionLabel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "mb-2.5 mt-[22px] text-[12px] font-bold uppercase tracking-[0.04em] text-muted-foreground first:mt-0",
      className
    )}
  >
    {children}
  </div>
);

/** .field label */
export const FieldLabel = ({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) => (
  <label
    htmlFor={htmlFor}
    className="mb-1.5 block text-[12.5px] font-semibold text-foreground"
  >
    {children}
    {hint ? (
      <span className="font-normal text-muted-foreground"> {hint}</span>
    ) : null}
  </label>
);

/** .field .hint */
export const FieldHint = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-[5px] text-[11px] leading-[1.5] text-muted-foreground">
    {children}
  </div>
);

export const controlClassName =
  "w-full rounded-md border border-input bg-card px-[11px] py-2 text-[13px] text-foreground outline-none transition-colors placeholder:text-[#a3a3a3] focus:border-ring";

export const TextField = ({
  className,
  ...props
}: React.ComponentProps<"input">) => (
  <input className={cn(controlClassName, className)} {...props} />
);

export const TextAreaField = ({
  className,
  ...props
}: React.ComponentProps<"textarea">) => (
  <textarea className={cn(controlClassName, "resize-none", className)} {...props} />
);

export const SelectField = ({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) => (
  <select className={cn(controlClassName, className)} {...props}>
    {children}
  </select>
);

/** .link-field — bordered row with a leading icon and a borderless mono input */
export const LinkField = ({
  icon,
  className,
  ...props
}: React.ComponentProps<"input"> & { icon: React.ReactNode }) => (
  <div className="flex items-center gap-2 rounded-md border border-input bg-card px-[11px] py-2">
    <span className="flex-none text-muted-foreground">{icon}</span>
    <input
      className={cn(
        "flex-1 border-none bg-transparent p-0 font-mono text-[13px] text-foreground outline-none placeholder:text-[#a3a3a3]",
        className
      )}
      {...props}
    />
  </div>
);

/** .grid2 */
export const Grid2 = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("grid grid-cols-1 gap-3.5 md:grid-cols-2", className)}>
    {children}
  </div>
);

/* ---------- badges ---------- */

const badgeTones = {
  success:
    "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0] dark:bg-emerald-950/40 dark:border-emerald-900",
  warn: "bg-[#fffbeb] text-[#b45309] border-[#fde68a] dark:bg-amber-950/40 dark:border-amber-900",
  info: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe] dark:bg-blue-950/40 dark:border-blue-900",
  neutral: "bg-muted text-muted-foreground border-transparent",
} as const;

export const Badge = ({
  tone = "neutral",
  className,
  children,
}: {
  tone?: keyof typeof badgeTones;
  className?: string;
  children: React.ReactNode;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[10.5px] font-bold",
      badgeTones[tone],
      className
    )}
  >
    {children}
  </span>
);

/** .pill-node */
export const NodePill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ddd6fe] bg-[#f3f0ff] px-2.5 py-1 text-[11px] font-bold text-[#5b21b6] dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300">
    <span className="size-1.5 rounded-full bg-[#7c3aed]" />
    {children}
  </span>
);

/* ---------- callouts ---------- */

const InfoCircle = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={cn("mt-px flex-none", className)}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

/** .no-store-note */
export const NoStoreNote = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-border bg-muted px-[13px] py-[11px] text-[12px] leading-[1.5] text-foreground">
    <InfoCircle className="text-[#6d28d9]" />
    <div>{children}</div>
  </div>
);

/** .node-banner */
export const NodeBanner = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-[22px] flex items-start gap-3 rounded-[12px] border border-[#ddd6fe] bg-[#f8f7ff] px-4 py-3.5 dark:border-violet-900 dark:bg-violet-950/30">
    <span className="flex size-8 flex-none items-center justify-center rounded-[9px] bg-[#6d28d9] text-white">
      {icon}
    </span>
    <div>
      <h4 className="mb-[3px] text-[13px] font-bold text-[#4c1d95] dark:text-violet-200">
        {title}
      </h4>
      <p className="m-0 text-[12px] leading-[1.5] text-[#5b21b6] dark:text-violet-300">
        {children}
      </p>
    </div>
  </div>
);

/* ---------- buttons ---------- */

export const btnBase =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-transparent px-[18px] py-[9px] text-[13px] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50";

export const Btn = ({
  variant = "outline",
  className,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "primary" | "outline" | "ghost";
}) => (
  <button
    type="button"
    className={cn(
      btnBase,
      variant === "primary" &&
        "bg-primary text-primary-foreground hover:bg-primary/90",
      variant === "outline" &&
        "border-border bg-card text-foreground hover:bg-muted",
      variant === "ghost" && "text-muted-foreground hover:text-foreground",
      className
    )}
    {...props}
  />
);

/** .btn-row */
export const BtnRow = ({
  left,
  children,
}: {
  left: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="mt-[26px] flex items-center justify-between border-t border-border pt-5">
    {left}
    <div className="flex gap-2.5">{children}</div>
  </div>
);

/* ---------- inline icons (matching the mockup SVGs) ---------- */

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
} as const;

export const ArrowRightIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} {...iconProps}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const ArrowLeftIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} {...iconProps}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const RefreshIcon = ({
  size = 14,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg width={size} height={size} {...iconProps} className={className}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export const CheckIcon = ({
  size = 12,
  strokeWidth = 3,
}: {
  size?: number;
  strokeWidth?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const AlertIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const ChevronDownIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} {...iconProps}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const FileIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} {...iconProps}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export const LinkIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} {...iconProps}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const DatabaseIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} {...iconProps}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

export const MapIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} {...iconProps}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

export const ServerIcon = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} {...iconProps}>
    <rect x="2" y="14" width="20" height="8" rx="2" />
    <rect x="2" y="2" width="20" height="8" rx="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
);
