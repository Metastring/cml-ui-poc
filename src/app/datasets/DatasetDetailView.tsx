"use client";

import { useState } from "react";
import {
  useGetDatasetDetails,
  useGetDatasetTableRows,
  useGetDatasetTables,
} from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import { DatasetDetailViewProps } from "@/types/app/datasets.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  FileText,
  Users,
  Building2,
  BarChart3,
  ListFilter,
  Database,
} from "lucide-react";
import { Typography } from "@/components/ui/typography";

const renderVal = (value: string | number | boolean | null | undefined) => {
  if (value === null || value === undefined) return <Typography variant="inherit" as="span" tone="muted">—</Typography>;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

const TableRowMeta = ({ label, value }: { label: string; value: string | number | boolean | null | undefined }) => (
  <TableRow>
    <TableHead className="w-[180px] font-normal text-muted-foreground text-sm">
      {label}
    </TableHead>
    <TableCell className="text-foreground break-words py-2.5">
      {renderVal(value)}
    </TableCell>
  </TableRow>
);

const PAGE_SIZE = 100;

const NUMERIC_TYPES = ["int", "numeric", "double", "real", "decimal", "float"];

const isNumericType = (type: string) =>
  NUMERIC_TYPES.some((t) => type.toLowerCase().includes(t));

const DatasetDataSection = ({ datasetTitle }: { datasetTitle: string }) => {
  const [offset, setOffset] = useState(0);

  const {
    data: tables,
    isLoading: isTablesLoading,
    error: tablesError,
  } = useGetDatasetTables(datasetTitle);

  const tableName = tables?.datasets?.[0]?.table ?? "";
  const {
    data: rowsData,
    isFetching: isRowsFetching,
    error: rowsError,
  } = useGetDatasetTableRows(tableName, PAGE_SIZE, offset);

  const columns = rowsData?.columns ?? [];
  const rows = rowsData?.rows ?? [];
  const totalRows = rowsData?.total_rows ?? 0;

  const from = offset + 1;
  const to = Math.min(offset + rows.length, totalRows);
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));

  const goToPage = (nextOffset: number) => {
    setOffset(nextOffset);
  };

  const renderBody = () => {
    if (isTablesLoading || (tableName && !rowsData)) {
      return (
        <div className="flex items-center py-6">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          <Typography variant="body" as="span" tone="muted" className="ml-2">
            Loading data…
          </Typography>
        </div>
      );
    }

    if (tablesError || rowsError) {
      return (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Failed to load data. Please try again.
        </div>
      );
    }

    if (!tableName || tables?.available === false) {
      return <Typography variant="body" tone="muted">No data available.</Typography>;
    }

    if (!rows.length) {
      return <Typography variant="body" tone="muted">No records found.</Typography>;
    }

    return (
      <div className="relative max-h-[520px] overflow-auto rounded-lg border border-border">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.name}
                  title={c.type}
                  className={`sticky top-0 z-10 whitespace-nowrap border-b border-border bg-muted px-3 py-2.5 font-medium text-foreground ${
                    isNumericType(c.type) ? "text-right" : "text-left"
                  }`}
                >
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="transition-colors hover:bg-muted/50">
                {columns.map((c) => (
                  <td
                    key={c.name}
                    className={`whitespace-nowrap border-b border-border px-3 py-2.5 ${
                      isNumericType(c.type)
                        ? "text-right tabular-nums"
                        : "text-left"
                    }`}
                  >
                    {renderVal(row[c.name])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Typography variant="h4" as="h2" tone="default" className="flex items-center gap-2">
          <Database className="size-4 text-primary" />
          Data
        </Typography>
        <div className="flex flex-wrap items-center gap-2">
          <Typography variant="small" as="span" tone="muted" numeric>
            {totalRows
              ? `${from}–${to} of ${totalRows} · page ${page}/${totalPages}`
              : "—"}
            {isRowsFetching && " · updating…"}
          </Typography>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={offset === 0 || isRowsFetching}
            onClick={() => goToPage(Math.max(0, offset - PAGE_SIZE))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={to >= totalRows || isRowsFetching}
            onClick={() => goToPage(offset + PAGE_SIZE)}
          >
            Next
          </Button>
        </div>
      </div>
      {renderBody()}
    </section>
  );
};

const DatasetDetailView = ({
  categoryName,
  datasetTitle,
}: DatasetDetailViewProps) => {
  const { data: d, isLoading, error } = useGetDatasetDetails(categoryName, datasetTitle);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <Typography variant="body" as="span" tone="muted" className="ml-2">Loading…</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Failed to load dataset details. Please try again.
      </div>
    );
  }

  if (!d) {
    return <Typography variant="body" tone="muted">No data found.</Typography>;
  }

  return (
    <div className="space-y-10">
      {/* Description */}
      {d.description && (
        <section>
          <Typography variant="h4" as="h2" tone="default" className="mb-2 flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            Description
          </Typography>
          <Typography variant="paragraph" tone="muted" className="max-w-3xl">
            {d.description}
          </Typography>
          {d.citation && (
            <Typography variant="helper" className="mt-3 max-w-3xl">
              <Typography variant="inherit" as="span" tone="default" weight="medium">Citation:</Typography> {d.citation}
            </Typography>
          )}
        </section>
      )}

      {/* Metadata table */}
      <section>
        <Typography variant="h4" as="h2" tone="default" className="mb-3">Metadata</Typography>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableBody>
              <TableRowMeta label="Category" value={d.category_name} />
              <TableRowMeta label="Dataset title" value={d.dataset_title} />
              <TableRowMeta label="DOI" value={d.doi} />
              <TableRowMeta label="License" value={d.license} />
              <TableRowMeta label="Language" value={d.language} />
              <TableRowMeta label="Data language" value={d.data_language} />
              <TableRowMeta label="Publication date" value={d.publication_date} />
              <TableRowMeta label="Last updated" value={d.last_updated} />
              <TableRowMeta label="Registration date" value={d.registration_date} />
              <TableRowMeta label="Dataset type" value={d.dataset_type} />
              <TableRowMeta label="Active" value={d.is_active} />
              {d.keywords != null && d.keywords !== "" && (
                <TableRowMeta label="Keywords" value={d.keywords} />
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Indicator — ontology_mapping_to_display from fields */}
      {d.fields?.length ? (
        <section>
          <Typography variant="h4" as="h2" tone="default" className="mb-3 flex items-center gap-2">
            <ListFilter className="size-4 text-primary" />
            Indicator
          </Typography>
          <ul className="rounded-lg border border-border overflow-hidden divide-y divide-border max-h-[280px] overflow-y-auto">
            {d.fields.map((f, i) => (
              <li
                key={i}
                className="px-4 py-2.5 text-sm"
              >
                {renderVal(f.ontology_mapping_to_display)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Data — rows from /db/tables */}
      <DatasetDataSection datasetTitle={datasetTitle} />

      {/* Contacts */}
      <section>
        <Typography variant="h4" as="h2" tone="default" className="mb-3 flex items-center gap-2">
          <Users className="size-4 text-primary" />
          Contacts
        </Typography>
        {d.contacts?.length ? (
          <ul className="space-y-4">
            {d.contacts.map((c, i) => (
              <li
                key={i}
                className="rounded-lg border border-border/80 bg-muted/30 p-4 text-sm"
              >
                <Typography variant="inherit" tone="default" weight="medium">{renderVal(c.name)}</Typography>
                {(c.role ?? c.email ?? c.organization) && (
                  <Typography variant="inherit" tone="muted" className="mt-1">
                    {[c.role, c.email, c.organization].filter(Boolean).join(" · ")}
                  </Typography>
                )}
                {(c.address ?? c.city ?? c.state ?? c.country) && (
                  <Typography variant="small" tone="muted" className="mt-1">
                    {[c.address, c.city, c.state, c.country].filter(Boolean).join(", ")}
                  </Typography>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Typography variant="body" tone="muted">No contacts listed.</Typography>
        )}
      </section>

      {/* Publishers */}
      <section>
        <Typography variant="h4" as="h2" tone="default" className="mb-3 flex items-center gap-2">
          <Building2 className="size-4 text-primary" />
          Publishers
        </Typography>
        {d.publishers?.length ? (
          <div className="flex flex-wrap gap-2">
            {d.publishers.map((p, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm"
              >
                <Typography variant="inherit" as="span" tone="default" weight="medium">{renderVal(p.publisher_name)}</Typography>
                {p.country != null && (
                  <Badge variant="secondary" className="font-normal text-xs rounded-full">
                    {p.country}
                  </Badge>
                )}
                {p.record_count != null && (
                  <Typography variant="small" as="span" tone="muted">{p.record_count} records</Typography>
                )}
              </span>
            ))}
          </div>
        ) : (
          <Typography variant="body" tone="muted">No publishers listed.</Typography>
        )}
      </section>

      {/* Statistics */}
      <section>
        <Typography variant="h4" as="h2" tone="default" className="mb-3 flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" />
          Statistics
        </Typography>
        {d.statistics?.length ? (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableBody>
                {d.statistics.map((st, i) => (
                  <TableRow key={i}>
                    <TableHead className="w-[200px] font-normal text-muted-foreground text-sm">
                      {renderVal(st.stat_name ?? "—")}
                    </TableHead>
                    <TableCell className="font-medium tabular-nums py-2.5">
                      {renderVal(st.stat_value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Typography variant="body" tone="muted">No statistics available.</Typography>
        )}
      </section>
    </div>
  );
};

export default DatasetDetailView;
