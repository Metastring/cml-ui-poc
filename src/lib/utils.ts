import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Teach tailwind-merge the custom typography tokens from globals.css,
// so e.g. `text-body` and `text-xs` are treated as conflicting font sizes.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "h1", "h2", "h3", "h4", "lead", "body", "small", "caption", "micro", "nano", "compact", "hero"],
      font: ["heading"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
