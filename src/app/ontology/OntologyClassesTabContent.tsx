"use client";

import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { OntologyClassListItem } from "./cphrOntologyTypes";
import { formatOntologyGroup } from "./cphrOntologyGroupLabels";
import {
  useOntologyClassDetail,
  useOntologyClassesList,
} from "./cphrOntologyHooks";

type GroupFilter = "all" | string;

interface OntologyClassesTabContentProps {
  apiEnabled: boolean;
  summaryGroupKeys: string[];
  selectedClassName: string | null;
  onSelectedClassNameChange: (name: string | null) => void;
}

export default function OntologyClassesTabContent({
  apiEnabled,
  summaryGroupKeys,
  selectedClassName,
  onSelectedClassNameChange,
}: OntologyClassesTabContentProps) {
  const [group, setGroup] = useState<GroupFilter>("all");

  const classesQ = useOntologyClassesList(group, apiEnabled);
  const detailQ = useOntologyClassDetail(selectedClassName, apiEnabled);

  const items = classesQ.data?.items ?? [];
  const groupKeys = useMemo(() => {
    if (summaryGroupKeys.length) return [...summaryGroupKeys].sort();
    const fromItems = classesQ.data?.items.map((i) => i.group) ?? [];
    return [...new Set(fromItems)].sort();
  }, [classesQ.data?.items, summaryGroupKeys]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[420px]">
      <Card className="lg:w-80 shrink-0 border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Classes</CardTitle>
          <Select
            value={group}
            onValueChange={(v) => {
              setGroup(v);
              onSelectedClassNameChange(null);
            }}
          >
            <SelectTrigger className="h-9" aria-label="Filter by group">
              <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All groups</SelectItem>
              {groupKeys.map((g) => (
                <SelectItem key={g} value={g}>
                  {formatOntologyGroup(g)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="max-h-[50vh] overflow-y-auto pt-0">
          {classesQ.isLoading && (
            <div className="flex justify-center py-8 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
            </div>
          )}
          {classesQ.isError && (
            <p className="text-sm text-destructive">
              {classesQ.error instanceof Error
                ? classesQ.error.message
                : "Failed to load classes"}
            </p>
          )}
          {!classesQ.isLoading && items.length === 0 && (
            <p className="text-sm text-muted-foreground">No classes.</p>
          )}
          <ul className="space-y-1">
            {items.map((c: OntologyClassListItem) => (
              <li key={c.name}>
                <Button
                  type="button"
                  variant={
                    selectedClassName === c.name ? "secondary" : "ghost"
                  }
                  className="w-full justify-start h-auto py-2 px-2 font-normal"
                  onClick={() => onSelectedClassNameChange(c.name)}
                >
                  <span className="truncate text-left">{c.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="flex-1 border-border/60 min-w-0">
        <CardHeader>
          <CardTitle className="text-base">
            {selectedClassName ? selectedClassName : "Select a class"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
          {!selectedClassName && (
            <p className="text-sm text-muted-foreground">
              Choose a class to see parents, children, datatype and object
              properties, and covered fields.
            </p>
          )}
          {selectedClassName && detailQ.isLoading && (
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          )}
          {selectedClassName && detailQ.isError && (
            <p className="text-sm text-destructive">
              {detailQ.error instanceof Error
                ? detailQ.error.message
                : "Failed to load class"}
            </p>
          )}
          {detailQ.data && (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Label
                </p>
                <p className="text-sm">{detailQ.data.label || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Comment
                </p>
                <p className="text-sm text-muted-foreground">
                  {detailQ.data.comment || "—"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="outline">
                  {formatOntologyGroup(detailQ.data.group)}
                </Badge>
                {detailQ.data.section_title && (
                  <span className="text-xs text-muted-foreground">
                    {detailQ.data.section_title}
                  </span>
                )}
              </div>
              <Section title="Parents (rdfs:subClassOf)">
                {detailQ.data.parents?.length ? (
                  <code className="text-xs break-all">
                    {detailQ.data.parents.join(", ")}
                  </code>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </Section>
              <Section title="Children">
                {detailQ.data.children?.length ? (
                  <code className="text-xs break-all">
                    {detailQ.data.children.join(", ")}
                  </code>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </Section>
              <Section title="Covered fields">
                <div className="flex flex-wrap gap-1">
                  {detailQ.data.covered_fields?.map((f) => (
                    <Badge
                      key={f}
                      variant="secondary"
                      className="font-mono text-xs"
                    >
                      {f}
                    </Badge>
                  )) ?? "—"}
                </div>
              </Section>
              <PropTable
                title="Datatype properties"
                rows={detailQ.data.datatype_properties ?? []}
              />
              <PropTable
                title="Outgoing object properties"
                rows={detailQ.data.outgoing_object_properties ?? []}
              />
              <PropTable
                title="Incoming object properties"
                rows={detailQ.data.incoming_object_properties ?? []}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
      {children}
    </div>
  );
}

function PropTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<{
    name: string;
    label: string;
    property_type: string;
    domains: string[];
    ranges: string[];
  }>;
}) {
  if (!rows.length) {
    return (
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
        <p className="text-sm text-muted-foreground">None</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2">{title}</p>
      <div className="rounded-md border border-border/60 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Range</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={`${title}-${r.name}`}>
                <TableCell className="font-mono text-xs">{r.name}</TableCell>
                <TableCell className="text-sm">{r.label}</TableCell>
                <TableCell className="text-xs">{r.property_type}</TableCell>
                <TableCell className="text-xs font-mono">
                  {r.domains?.join(", ") || "—"}
                </TableCell>
                <TableCell className="text-xs font-mono">
                  {r.ranges?.join(", ") || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
