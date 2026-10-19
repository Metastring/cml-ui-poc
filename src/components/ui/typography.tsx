import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "font-heading text-h1 font-bold tracking-tight sm:text-display",
      h2: "font-heading text-h2 font-semibold leading-tight tracking-tight",
      h3: "font-heading text-h3 font-semibold",
      h4: "font-heading text-h4 font-semibold",
      lead: "text-lead",
      paragraph: "text-body leading-relaxed",
      body: "text-body",
      small: "text-small",
      caption: "text-caption",
      helper: "text-small leading-relaxed text-muted-foreground",
      error: "text-body font-medium text-destructive",
      label: "text-body font-medium leading-none",
      input: "text-lead md:text-body",
      overline: "text-caption font-medium uppercase tracking-[0.09em]",
      tableHead: "text-small font-semibold uppercase tracking-wider",
      link: "font-medium underline underline-offset-4 hover:text-foreground",
      button: "text-body font-medium",
      mono: "font-mono text-small",
      /** No size or weight of its own; inherits from the parent. */
      inherit: "",
    },
    tone: {
      inherit: "",
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
    truncate: {
      true: "truncate",
    },
    numeric: {
      true: "tabular-nums",
    },
  },
  defaultVariants: {
    variant: "body",
    tone: "inherit",
  },
})

type TypographyVariant = NonNullable<
  VariantProps<typeof typographyVariants>["variant"]
>

const defaultElement: Record<TypographyVariant, React.ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  lead: "p",
  paragraph: "p",
  body: "p",
  small: "p",
  caption: "span",
  helper: "p",
  error: "p",
  label: "span",
  input: "span",
  overline: "span",
  tableHead: "span",
  link: "a",
  button: "span",
  mono: "code",
  inherit: "p",
}

type TypographyProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants> & {
    /** Render as a different element, e.g. an h2 styled as h4. */
    as?: React.ElementType
    /** Merge typography styles onto the single child element instead. */
    asChild?: boolean
  }

function Typography({
  className,
  variant,
  tone,
  weight,
  align,
  truncate,
  numeric,
  as,
  asChild = false,
  ...props
}: TypographyProps) {
  const Comp = asChild ? Slot : as ?? defaultElement[variant ?? "body"]

  return (
    <Comp
      data-slot="typography"
      className={cn(
        typographyVariants({ variant, tone, weight, align, truncate, numeric }),
        className
      )}
      {...props}
    />
  )
}

export { Typography, typographyVariants }
export type { TypographyProps, TypographyVariant }
