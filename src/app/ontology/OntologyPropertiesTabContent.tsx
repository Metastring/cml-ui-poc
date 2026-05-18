"use client";

import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOntologyClassesList, useOntologyPropertiesList } from "./cphrOntologyHooks";

interface OntologyPropertiesTabContentProps {
  apiEnabled: boolean;
}

export default function OntologyPropertiesTabContent({
  apiEnabled,
}: OntologyPropertiesTabContentProps) {
  const [propType, setPropType] = useState<string>("all");
  const [className, setClassName] = useState<string>("all");

  const classesQ = useOntologyClassesList("all", apiEnabled);
  const classNames = useMemo(
    () => classesQ.data?.items.map((i) => i.name) ?? [],
    [classesQ.data?.items]
  );

  const filters = {
    property_type:
      propType === "all"
        ? undefined
        : (propType as "object" | "datatype"),
    class_name: className === "all" ? undefined : className,
  };

  const propsQ = useOntologyPropertiesList(filters, apiEnabled);
  const rows = propsQ.data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={propType} onValueChange={setPropType}>
          <SelectTrigger className="w-[200px] h-9" aria-label="Property type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="object">Object</SelectItem>
            <SelectItem value="datatype">Datatype</SelectItem>
          </SelectContent>
        </Select>
        <Select value={className} onValueChange={setClassName}>
          <SelectTrigger className="w-[240px] h-9" aria-label="Filter by class">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any class</SelectItem>
            {classNames.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {propsQ.isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
      {propsQ.isError && (
        <p className="text-sm text-destructive">
          {propsQ.error instanceof Error
            ? propsQ.error.message
            : "Failed to load properties"}
        </p>
      )}

      {!propsQ.isLoading && !propsQ.isError && (
        <div className="rounded-md border border-border/60 overflow-x-auto max-h-[65vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Range</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No properties match filters.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={`${r.name}-${r.property_type}`}>
                    <TableCell className="font-mono text-xs">{r.name}</TableCell>
                    <TableCell className="text-sm">{r.label}</TableCell>
                    <TableCell className="text-xs">{r.property_type}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">
                      {r.comment || "—"}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {r.domains?.join(", ") || "—"}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {r.ranges?.join(", ") || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
