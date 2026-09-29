"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  DataReferenceForm,
  ReachabilityResult,
  ReferenceType,
} from "@/types/app/contribute.types";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Badge,
  Btn,
  BtnRow,
  CardHead,
  CheckIcon,
  DatabaseIcon,
  FieldHint,
  FieldLabel,
  FileIcon,
  Grid2,
  LinkField,
  LinkIcon,
  MapIcon,
  NoStoreNote,
  SectionLabel,
  SelectField,
  RefreshIcon,
  TextField,
} from "./RegistrationUI";

export const FILE_FORMAT_OPTIONS = ["CSV", "JSON", "XML", "XLSX", "Parquet"];
export const RESPONSE_FORMAT_OPTIONS = ["JSON", "CSV", "XML"];
export const ENGINE_OPTIONS = ["PostgreSQL", "MySQL", "SQL Server", "Oracle"];
export const LAYER_TYPE_OPTIONS = [
  "Vector (WFS)",
  "Raster (WMS)",
  "Tiles (WMTS)",
];

const REFERENCE_CHOICES: {
  type: ReferenceType;
  icon: React.ReactNode;
  title: string;
  description: string;
}[] = [
  {
    type: "file",
    icon: <FileIcon />,
    title: "File path",
    description: "A path on your own server, NFS mount, or object store.",
  },
  {
    type: "url",
    icon: <LinkIcon />,
    title: "URL / API",
    description: "A live endpoint we can query for the current data.",
  },
  {
    type: "database",
    icon: <DatabaseIcon />,
    title: "Database",
    description: "A read-only connection string to a table you host.",
  },
  {
    type: "map-service",
    icon: <MapIcon />,
    title: "Map service",
    description: "A WMS/WFS/GeoServer layer already hosted by you.",
  },
];

interface DataReferenceStepProps {
  value: DataReferenceForm;
  verifyState: "idle" | "checking" | "done";
  verifyResult: ReachabilityResult | null;
  verifyError: string | null;
  isSavingDraft: boolean;
  isSaving: boolean;
  onChange: (patch: Partial<DataReferenceForm>) => void;
  onVerify: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

const DataReferenceStep: React.FC<DataReferenceStepProps> = ({
  value,
  verifyState,
  verifyResult,
  verifyError,
  isSavingDraft,
  isSaving,
  onChange,
  onVerify,
  onBack,
  onSaveDraft,
  onContinue,
}) => {
  const type = value.reference_type;

  return (
    <div>
      <CardHead title="Step 2 — Point to your data">
        Tell us where the dataset already lives. We&apos;ll record this as a
        reference and
        {type === "file"
          ? ", when needed, read from it directly"
          : " query it live when needed"}{" "}
        — we don&apos;t take a copy.
      </CardHead>

      <div className="mb-[22px] grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {REFERENCE_CHOICES.map((choice) => {
          const selected = type === choice.type;
          return (
            <button
              key={choice.type}
              type="button"
              onClick={() => onChange({ reference_type: choice.type })}
              className={cn(
                "relative rounded-[12px] border-[1.5px] bg-card px-3.5 py-4 text-left transition-colors",
                selected
                  ? "border-foreground bg-[rgba(23,23,23,0.035)] shadow-[0_0_0_3px_rgba(23,23,23,0.06)] dark:bg-white/5"
                  : "border-border hover:border-foreground/40"
              )}
            >
              {selected && (
                <span className="absolute right-3 top-3 flex size-[18px] items-center justify-center rounded-full bg-foreground text-background">
                  <CheckIcon size={11} />
                </span>
              )}
              <span
                className={cn(
                  "mb-3 flex size-9 items-center justify-center rounded-[9px]",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {choice.icon}
              </span>
              <h3 className="mb-1 text-[13.5px] font-bold text-foreground">
                {choice.title}
              </h3>
              <p className="m-0 text-[11.5px] leading-[1.45] text-muted-foreground">
                {choice.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* ---------- FILE ---------- */}
      {type === "file" && (
        <>
          <SectionLabel>File location</SectionLabel>
          <div>
            <FieldLabel htmlFor="reference_uri">File path or URI</FieldLabel>
            <LinkField
              id="reference_uri"
              icon={<FileIcon size={15} />}
              placeholder="s3://atree-field-data/species_survey_2025.csv"
              value={value.reference_uri}
              onChange={(e) => onChange({ reference_uri: e.target.value })}
            />
            <FieldHint>
              Local paths, network mounts (nfs://, smb://), or object storage URIs
              (s3://, gs://) are all fine — as long as your node can resolve it.
            </FieldHint>
          </div>

          <Grid2 className="mt-3.5">
            <div>
              <FieldLabel htmlFor="file_format">File format</FieldLabel>
              <SelectField
                id="file_format"
                value={value.file_format}
                onChange={(e) => onChange({ file_format: e.target.value })}
              >
                {FILE_FORMAT_OPTIONS.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </SelectField>
            </div>
            <div>
              <FieldLabel
                htmlFor="access_credentials_ref"
                hint="(optional, stored encrypted)"
              >
                Access credentials
              </FieldLabel>
              <TextField
                id="access_credentials_ref"
                placeholder="e.g. read-only access key reference"
                value={value.access_credentials_ref}
                onChange={(e) =>
                  onChange({ access_credentials_ref: e.target.value })
                }
              />
            </div>
          </Grid2>
        </>
      )}

      {/* ---------- URL / API ---------- */}
      {type === "url" && (
        <>
          <SectionLabel>Endpoint</SectionLabel>
          <div>
            <FieldLabel htmlFor="source_url">Source URL</FieldLabel>
            <LinkField
              id="source_url"
              icon={<LinkIcon size={15} />}
              placeholder="https://api.atree.org/v1/occurrences"
              value={value.source_url}
              onChange={(e) => onChange({ source_url: e.target.value })}
            />
          </div>

          <Grid2 className="mt-3.5">
            <div>
              <FieldLabel>Method</FieldLabel>
              <div className="inline-flex gap-0.5 rounded-[9px] bg-muted p-[3px]">
                {["GET", "POST"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => onChange({ method })}
                    className={cn(
                      "rounded-[7px] px-3.5 py-[7px] text-[12.5px] font-semibold transition-colors",
                      value.method === method
                        ? "bg-card text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                        : "text-muted-foreground"
                    )}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="response_format">Response format</FieldLabel>
              <SelectField
                id="response_format"
                value={value.response_format}
                onChange={(e) => onChange({ response_format: e.target.value })}
              >
                {RESPONSE_FORMAT_OPTIONS.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="md:col-span-2">
              <FieldLabel
                htmlFor="auth_header"
                hint="(optional, stored encrypted)"
              >
                Auth header
              </FieldLabel>
              <TextField
                id="auth_header"
                placeholder="Authorization: Bearer ••••••••"
                value={value.auth_header}
                onChange={(e) => onChange({ auth_header: e.target.value })}
              />
            </div>
          </Grid2>
        </>
      )}

      {/* ---------- DATABASE ---------- */}
      {type === "database" && (
        <>
          <SectionLabel>Connection</SectionLabel>
          <div>
            <FieldLabel
              htmlFor="connection_string"
              hint="(read-only credentials, stored encrypted)"
            >
              Connection string
            </FieldLabel>
            <LinkField
              id="connection_string"
              icon={<DatabaseIcon size={15} />}
              placeholder="postgres://readonly@db.atree.org:5432/forest_health"
              value={value.connection_string}
              onChange={(e) => onChange({ connection_string: e.target.value })}
            />
            <FieldHint>
              We connect with least-privilege, read-only access — no write access,
              and no export of the underlying rows.
            </FieldHint>
          </div>

          <Grid2 className="mt-3.5">
            <div>
              <FieldLabel htmlFor="table_name">Table / view to register</FieldLabel>
              <TextField
                id="table_name"
                placeholder="public.plot_observations"
                value={value.table_name}
                onChange={(e) => onChange({ table_name: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel htmlFor="engine">Engine</FieldLabel>
              <SelectField
                id="engine"
                value={value.engine}
                onChange={(e) => onChange({ engine: e.target.value })}
              >
                {ENGINE_OPTIONS.map((engine) => (
                  <option key={engine} value={engine}>
                    {engine}
                  </option>
                ))}
              </SelectField>
            </div>
          </Grid2>
        </>
      )}

      {/* ---------- MAP SERVICE ---------- */}
      {type === "map-service" && (
        <>
          <SectionLabel>Layer location</SectionLabel>
          <div>
            <FieldLabel htmlFor="map_service_url">Map service URL</FieldLabel>
            <LinkField
              id="map_service_url"
              icon={<MapIcon size={15} />}
              placeholder="https://geo.atree.org/geoserver/wms?layer=protected_areas"
              value={value.map_service_url}
              onChange={(e) => onChange({ map_service_url: e.target.value })}
            />
            <FieldHint>
              Point to a layer already served from your own GeoServer, MapServer,
              or similar — WMS, WFS, or WMTS.
            </FieldHint>
          </div>

          <Grid2 className="mt-3.5">
            <div>
              <FieldLabel htmlFor="layer_type">Layer type</FieldLabel>
              <SelectField
                id="layer_type"
                value={value.layer_type}
                onChange={(e) => onChange({ layer_type: e.target.value })}
              >
                {LAYER_TYPE_OPTIONS.map((layer) => (
                  <option key={layer} value={layer}>
                    {layer}
                  </option>
                ))}
              </SelectField>
            </div>
            <div>
              <FieldLabel htmlFor="layer_name">Layer name</FieldLabel>
              <TextField
                id="layer_name"
                placeholder="protected_areas"
                value={value.layer_name}
                onChange={(e) => onChange({ layer_name: e.target.value })}
              />
            </div>
          </Grid2>
        </>
      )}

      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
        <Btn onClick={onVerify} disabled={verifyState === "checking"}>
          <RefreshIcon className={verifyState === "checking" ? "animate-spin" : ""} />
          {verifyState === "checking" ? "Verifying…" : "Verify reachability"}
        </Btn>

        {verifyState === "done" && verifyResult?.reachable && (
          <Badge tone="success">
            {verifyResult.message ?? "Reachable"}
            {typeof verifyResult.columns_detected === "number"
              ? ` · ${verifyResult.columns_detected} columns detected in header`
              : ""}
          </Badge>
        )}
        {verifyState === "done" && verifyResult && !verifyResult.reachable && (
          <Badge tone="warn">
            {verifyResult.message ?? "Not reachable from CML"}
          </Badge>
        )}
        {verifyState === "done" && verifyError && (
          <Badge tone="warn">{verifyError}</Badge>
        )}
      </div>

      <NoStoreNote>
        {type === "file" && (
          <>
            We only read the file&apos;s header to suggest ontology mappings in
            the next step.{" "}
            <b className="font-bold">
              The file itself is never uploaded, copied, or stored on CML
            </b>{" "}
            — it stays at this path on your node.
          </>
        )}
        {type === "url" && (
          <>
            We fetch a sample response now only to suggest ontology mappings.{" "}
            <b className="font-bold">CML always queries this endpoint live</b> for
            current data — nothing is cached or stored centrally beyond the
            mapping itself.
          </>
        )}
        {type === "database" && (
          <>
            We read the table&apos;s column structure only, to suggest ontology
            mappings.{" "}
            <b className="font-bold">
              Row data is never copied out of your database
            </b>{" "}
            — CML queries it live, at read time, through this connection.
          </>
        )}
        {type === "map-service" && (
          <>
            We read the layer&apos;s capabilities and attribute schema only.{" "}
            <b className="font-bold">
              The map layer keeps rendering from your own GeoServer
            </b>{" "}
            — CML links to it, it doesn&apos;t rehost it.
          </>
        )}
      </NoStoreNote>

      <BtnRow
        left={
          <Btn onClick={onBack}>
            <ArrowLeftIcon />
            Back
          </Btn>
        }
      >
        <Btn onClick={onSaveDraft} disabled={isSavingDraft}>
          {isSavingDraft ? "Saving…" : "Save as draft"}
        </Btn>
        <Btn variant="primary" onClick={onContinue} disabled={isSaving}>
          {isSaving ? "Saving…" : "Continue"}
          <ArrowRightIcon />
        </Btn>
      </BtnRow>
    </div>
  );
};

export default DataReferenceStep;
