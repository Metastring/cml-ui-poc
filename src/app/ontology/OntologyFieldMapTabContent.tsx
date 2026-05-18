"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatOntologyGroup } from "./cphrOntologyGroupLabels";
import { useOntologyFieldMap } from "./cphrOntologyHooks";

interface OntologyFieldMapTabContentProps {
  apiEnabled: boolean;
}

export default function OntologyFieldMapTabContent({
  apiEnabled,
}: OntologyFieldMapTabContentProps) {
  const fmQ = useOntologyFieldMap(apiEnabled);

  if (fmQ.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (fmQ.isError) {
    return (
      <p className="text-sm text-destructive">
        {fmQ.error instanceof Error
          ? fmQ.error.message
          : "Failed to load field map"}
      </p>
    );
  }

  const sections = fmQ.data?.sections ?? [];

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
      {sections.map((sec) => (
        <Card key={sec.title} className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{sec.title}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {formatOntologyGroup(sec.group)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {sec.entries.map((en) => (
              <div
                key={en.class_name}
                className="rounded-md border border-border/50 p-3 bg-muted/20"
              >
                <p className="font-mono text-sm font-medium">{en.class_name}</p>
                {en.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {en.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {en.covered_fields.map((f) => (
                    <Badge
                      key={f}
                      variant="outline"
                      className="font-mono text-[10px]"
                    >
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
