"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useSmartSearchStore } from "@/store/smart_search_store/useSmartSearchStore";
import { cn } from "@/lib/utils";

/**
 * Standalone Smart Search toggle. Reads and writes the global store directly so
 * it can be dropped into any page without wiring props through that page's logic.
 */
export function SmartSearchSwitch({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSmartSearch = useSmartSearchStore((state) => state.isSmartSearch);
  const setIsSmartSearch = useSmartSearchStore(
    (state) => state.setIsSmartSearch
  );

  // The URL is the source of truth, so deep links and browser back/forward
  // both land on the right mode. Toggling only rewrites the query param.
  React.useEffect(() => {
    const modeFromUrl = searchParams?.get("mode") === "smart";
    if (modeFromUrl !== isSmartSearch) setIsSmartSearch(modeFromUrl);
  }, [searchParams, isSmartSearch, setIsSmartSearch]);

  const handleToggle = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (isSmartSearch) params.delete("mode");
    else params.set("mode", "smart");
    const queryString = params.toString();
    const path = pathname ?? "";
    router.replace(queryString ? `${path}?${queryString}` : path, {
      scroll: false,
    });
  };

  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-border bg-card/80 px-3.5 py-2 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <Sparkles
        size={14}
        className={cn(
          "transition-colors",
          isSmartSearch ? "text-primary" : "text-muted-foreground"
        )}
        aria-hidden
      />
      <span
        className={cn(
          "text-xs font-medium transition-colors",
          isSmartSearch ? "text-primary" : "text-muted-foreground"
        )}
      >
        Smart Search
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isSmartSearch}
        aria-label="Smart Search"
        onClick={handleToggle}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          isSmartSearch ? "bg-primary" : "bg-border"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-card shadow-sm transition-transform",
            isSmartSearch && "translate-x-4"
          )}
        />
      </button>
    </label>
  );
}
