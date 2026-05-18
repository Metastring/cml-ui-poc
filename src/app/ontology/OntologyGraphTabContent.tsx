"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatOntologyGroup } from "./cphrOntologyGroupLabels";
import { useOntologyGraph } from "./cphrOntologyHooks";

interface OntologyGraphTabContentProps {
  apiEnabled: boolean;
}

export default function OntologyGraphTabContent({
  apiEnabled,
}: OntologyGraphTabContentProps) {
  const graphQ = useOntologyGraph(apiEnabled);
  const data = graphQ.data;

  if (graphQ.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (graphQ.isError) {
    return (
      <p className="text-sm text-destructive">
        {graphQ.error instanceof Error
          ? graphQ.error.message
          : "Failed to load graph"}
      </p>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-semibold mb-2">Class nodes</h3>
        <div className="rounded-md border border-border/60 overflow-x-auto max-h-[40vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.nodes.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-mono text-xs">{n.id}</TableCell>
                  <TableCell className="text-sm">{n.label}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {formatOntologyGroup(n.group)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{n.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold mb-2">Edges</h3>
        <div className="rounded-md border border-border/60 overflow-x-auto max-h-[35vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.edges.map((e, i) => (
                <TableRow key={`${e.source}-${e.target}-${i}`}>
                  <TableCell className="font-mono text-xs">{e.source}</TableCell>
                  <TableCell className="text-xs">{e.label}</TableCell>
                  <TableCell className="font-mono text-xs">{e.target}</TableCell>
                  <TableCell className="text-xs">{e.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold mb-2">
          Unresolved object properties
        </h3>
        <p className="text-xs text-muted-foreground mb-2">
          Properties with range but no explicit domain in the graph export.
        </p>
        <div className="rounded-md border border-border/60 overflow-x-auto max-h-[30vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Range</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.unresolved_object_properties.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-6"
                  >
                    None
                  </TableCell>
                </TableRow>
              ) : (
                data.unresolved_object_properties.map((u) => (
                  <TableRow key={u.name}>
                    <TableCell className="font-mono text-xs">{u.name}</TableCell>
                    <TableCell className="text-sm">{u.label}</TableCell>
                    <TableCell className="text-xs font-mono">
                      {u.ranges?.join(", ")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
