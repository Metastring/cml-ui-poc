"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DatasetDetailView from "../../DatasetDetailView";

export default function DatasetPage() {
  const params = useParams();
  const category = decodeURIComponent((params.category as string) ?? "");
  const dataset = decodeURIComponent((params.dataset as string) ?? "");

  if (!category || !dataset) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-muted-foreground">Invalid dataset link.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/datasets">Back to catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 h-8 text-muted-foreground hover:text-foreground">
              <Link href="/datasets">
                <ArrowLeft className="size-3.5" />
                Catalog
              </Link>
            </Button>
            <ChevronRight className="size-3.5 shrink-0" />
            <span className="truncate">{category}</span>
            <ChevronRight className="size-3.5 shrink-0" />
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none" title={dataset}>
              {dataset}
            </span>
          </nav>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight break-words">
            {dataset}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{category}</p>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <DatasetDetailView categoryName={category} datasetTitle={dataset} />
      </main>
    </div>
  );
}
