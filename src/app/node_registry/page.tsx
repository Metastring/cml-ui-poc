"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useDetachSelf,
  useGetNodeDatasets,
  useGetNodeManifest,
  useGetRegisteredNodes,
  useRegisterSelf,
  useRevokeNode,
  useSendHeartbeat,
} from "@/api/nodeRegistryApiHandler/NodeRegistryApiHandler";
import {
  NodeDatasetField,
  NodeManifest,
  NodeStatus,
  RegisteredNode,
} from "@/types/api/nodeRegistry.types";

/** What the drawer needs to open: the id to fetch and a name to show meanwhile. */
type ViewedNode = { node_id: string; name: string };

const STATUS_STYLES: Record<NodeStatus | "self", string> = {
  self: "bg-primary/10 text-primary border-primary/20",
  active:
    "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  stale: "bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-500/20",
  detached: "bg-muted text-muted-foreground border-border",
  revoked: "bg-red-500/12 text-red-700 dark:text-red-400 border-red-500/20",
};

const StatusBadge = ({ status }: { status: NodeStatus | "self" }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
      STATUS_STYLES[status] ?? STATUS_STYLES.detached
    }`}
  >
    {status}
  </span>
);

/** Stands in for the status badge when this node holds no registry entry. */
const UnregisteredBadge = () => (
  <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
    not registered
  </span>
);

const relativeTime = (timestamp: string | null) => {
  if (!timestamp) return "—";
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return "—";
  return formatDistanceToNow(parsed, { addSuffix: true });
};

const StatTile = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: string;
}) => (
  <Card className="border-border/60 shadow-sm">
    <CardContent className="px-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-3xl font-semibold ${tone ?? "text-foreground"}`}>
        {value}
      </p>
    </CardContent>
  </Card>
);

/** Shared chip style — keyword and indicator chips read the same. */
const CHIP_CLASS =
  "max-w-full break-words rounded-full border border-border px-2.5 py-1 text-xs text-foreground";

/**
 * Indicators of one dataset: the ontology term each mapped column resolves to.
 * Only `ontology_mapping_to_display` is shown — the column name, data type and
 * raw mapping key/URI are deliberately left out.
 */
const IndicatorList = ({ indicators }: { indicators: string[] }) => (
  <ul className="mt-3 flex flex-wrap gap-1.5">
    {indicators.map((indicator) => (
      <li
        key={indicator}
        className={CHIP_CLASS}
      >
        {indicator}
      </li>
    ))}
  </ul>
);

/** Display names of the ontology terms this dataset's columns map to. */
const indicatorsOf = (fields: NodeDatasetField[]) =>
  Array.from(
    new Set(
      fields
        .map((field) => field.ontology_mapping_to_display)
        .filter((term): term is string => Boolean(term))
    )
  );

/** `keywords` arrives as one comma-separated string, so split it before showing. */
const keywordsOf = (keywords: string | null) =>
  Array.from(
    new Set(
      (keywords ?? "")
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean)
    )
  );

/**
 * Body of the node detail drawer: GET /nodes/{node_id}/datasets.
 * Mounted with a `key` of the node id so it refetches per node.
 * A node that is down still answers 200 — `datasets_source` says whether the
 * list is live, a saved copy, or missing entirely.
 */
const NodeDatasetsPanel = ({ node }: { node: ViewedNode }) => {
  const { data, isLoading, isError } = useGetNodeDatasets(node.node_id);

  const datasets = data?.datasets ?? [];

  return (
    <>
      {/* Exactly two rows — truncation keeps a long name or URL from adding a third. */}
      <SheetHeader className="gap-0.5 border-b border-border/60 px-6 py-3">
        <div className="flex items-center gap-3 pr-8">
          <SheetTitle className="min-w-0 truncate text-xl">
            {data?.node.name ?? node.name}
          </SheetTitle>
          {data && (
            <span className="shrink-0">
              <StatusBadge status={data.node.status} />
            </span>
          )}
          {data && (
            <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
              {data.dataset_count} dataset
              {data.dataset_count === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <SheetDescription
          className="truncate font-mono text-xs"
          title={data?.node.base_url}
        >
          {data?.node.base_url ?? "Loading node details…"}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isLoading && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Contacting the node — this can take a few seconds.
            </p>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-12 w-full animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-destructive">
              Could not load this node&apos;s datasets.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              The node is not in the registry, or the registry is unreachable.
            </p>
          </div>
        )}

        {data && (
          <>
            {data.datasets_source === "cache" && (
              <p className="mb-4 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                Node unreachable — showing saved copy from{" "}
                {relativeTime(data.harvested_at)}.
              </p>
            )}

            {data.datasets_source === "unavailable" && (
              <p className="mb-4 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                Node unreachable; no saved dataset list.
              </p>
            )}

            {datasets.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No datasets to show.
              </p>
            ) : (
              <div className="space-y-4">
                {datasets.map((dataset) => {
                  const indicators = indicatorsOf(dataset.fields);
                  const keywords = keywordsOf(dataset.keywords);
                  return (
                    <Card
                      key={dataset.dataset_id}
                      className="gap-0 border-border/60 py-0 shadow-sm"
                    >
                      <CardContent className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <p className="break-words font-medium text-foreground">
                              {dataset.title}
                            </p>
                            {dataset.category && (
                              <Badge variant="secondary">
                                {dataset.category}
                              </Badge>
                            )}
                          </div>

                          {dataset.category ? (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-7 shrink-0 rounded-full border-primary/40 px-3 text-xs text-primary hover:bg-primary/5 hover:text-primary"
                            >
                              <Link
                                href={`/datasets/${encodeURIComponent(
                                  dataset.category
                                )}/${encodeURIComponent(dataset.title)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View details
                                <ExternalLink className="size-3.5" />
                              </Link>
                            </Button>
                          ) : (
                            <span className="shrink-0 text-xs text-muted-foreground">
                              No category — detail page unavailable
                            </span>
                          )}
                        </div>

                        {dataset.description && (
                          <p className="mt-2 break-words text-sm text-muted-foreground">
                            {dataset.description}
                          </p>
                        )}

                        {keywords.length > 0 && (
                          <div className="mt-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Keywords
                            </p>
                            <ul className="mt-2 flex flex-wrap gap-1.5">
                              {keywords.map((keyword) => (
                                <li
                                  key={keyword}
                                  className={CHIP_CLASS}
                                >
                                  {keyword}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="mt-4 border-t border-border/60 pt-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Indicators ({indicators.length})
                          </p>
                          {indicators.length === 0 ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              No indicators
                            </p>
                          ) : (
                            <IndicatorList indicators={indicators} />
                          )}
                        </div>

                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

/** One labelled value in the "This Node" card. */
const NodeField = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </p>
    <p className="mt-1 break-words text-sm text-foreground">{value}</p>
  </div>
);

/**
 * This node's own side of the federation: who it is, which central it is
 * registered with, and the actions only a node can take on itself.
 * Registration comes from `manifest.registered`, not from the listing — a
 * detached or revoked node keeps its row there, so being listed is not the
 * same as being a member.
 */
const ThisNodeCard = ({
  manifest,
  selfNode,
  onHeartbeat,
  isHeartbeating,
  onDetach,
  onRegister,
}: {
  manifest: NodeManifest;
  selfNode: RegisteredNode | null;
  onHeartbeat: () => void;
  isHeartbeating: boolean;
  onDetach: (revokeKey: boolean) => void;
  onRegister: () => void;
}) => {
  const isRegistered = manifest.registered;
  const selfStatus = selfNode?.status ?? null;

  return (
    <Card className="mt-6 border-border/60 shadow-sm">
      <CardContent className="px-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">This Node</h2>
          {isRegistered && selfStatus ? (
            <StatusBadge status={selfStatus} />
          ) : (
            <UnregisteredBadge />
          )}
        </div>

        <p
          className={`mt-1 max-w-3xl text-sm ${
            isRegistered
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-muted-foreground"
          }`}
        >
          {selfStatus === "revoked" && !isRegistered
            ? "This node's key has been revoked. It no longer works, so heartbeat and detach are unavailable — registering again is the only way back in."
            : isRegistered
            ? "Registered — the backend heartbeats on its own schedule; the button below forces one now."
            : "Not registered yet. Registering hands the registry this node's manifest and rejoins the federation."}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NodeField label="Node Name" value={manifest.node_name} />
          <NodeField label="Base URL" value={manifest.base_url} />
          <NodeField
            label="Last Heartbeat"
            value={relativeTime(selfNode?.last_heartbeat_at ?? null)}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {isRegistered ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-full px-4 text-xs"
                onClick={onHeartbeat}
                disabled={!selfNode || isHeartbeating}
                title={
                  selfNode
                    ? undefined
                    : "This node has no registry entry to heartbeat against."
                }
              >
                {isHeartbeating ? "Sending…" : "Send heartbeat now"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-full px-4 text-xs"
                onClick={() => onDetach(false)}
              >
                Detach from registry
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-full border-destructive/40 bg-destructive/5 px-4 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDetach(true)}
              >
                Revoke &amp; forget key
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-primary/40 px-4 text-xs text-primary hover:bg-primary/5 hover:text-primary"
              onClick={onRegister}
            >
              {selfStatus === "revoked"
                ? "Register again"
                : "Register with the registry"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function NodeRegistryPage() {
  const { data: manifest } = useGetNodeManifest();
  const { data, isLoading, isError, refetch } = useGetRegisteredNodes();
  const revokeNode = useRevokeNode();
  const sendHeartbeat = useSendHeartbeat();
  const detachSelf = useDetachSelf();
  const registerSelf = useRegisterSelf();

  const [nodeToRevoke, setNodeToRevoke] = useState<RegisteredNode | null>(null);
  const [nodeToView, setNodeToView] = useState<ViewedNode | null>(null);
  /** Which detach the confirm dialog is for: plain, or one that drops the key. */
  const [detachMode, setDetachMode] = useState<"detach" | "revoke-key" | null>(
    null
  );
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerMaintainer, setRegisterMaintainer] = useState("");

  const nodes: RegisteredNode[] = useMemo(() => data?.nodes ?? [], [data]);

  const stats = useMemo(() => {
    const count = (status: NodeStatus) =>
      nodes.filter((node) => node.status === status).length;
    return {
      total: nodes.length,
      active: count("active"),
      stale: count("stale"),
      inactive: count("detached") + count("revoked"),
    };
  }, [nodes]);

  /**
   * This node's own row in the registry. Central stores the manifest id under
   * `metadata.manifest_node_id`, so match on that first and fall back to the
   * base URL for rows registered before that field existed.
   */
  const selfNode = useMemo(() => {
    if (!manifest) return null;
    return (
      nodes.find(
        (node) => node.metadata?.manifest_node_id === manifest.node_id
      ) ??
      nodes.find((node) => node.base_url === manifest.base_url) ??
      null
    );
  }, [nodes, manifest]);

  const handleHeartbeat = () => {
    if (!selfNode) return;

    sendHeartbeat.mutate(undefined, {
      onSuccess: () => toast.success("Heartbeat sent"),
      onError: () => toast.error("Could not send heartbeat. Please try again."),
    });
  };

  const openRegisterDialog = () => {
    setRegisterName(manifest?.node_name ?? "");
    setRegisterMaintainer("");
    setIsRegisterOpen(true);
  };

  const handleRegister = () => {
    registerSelf.mutate(
      {
        name: registerName.trim(),
        maintained_by: registerMaintainer.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Registered with the registry");
          setIsRegisterOpen(false);
        },
        onError: () =>
          toast.error("Could not register this node. Please try again."),
      }
    );
  };

  const handleDetach = () => {
    if (!detachMode) return;
    const revokeKey = detachMode === "revoke-key";

    detachSelf.mutate(revokeKey, {
      onSuccess: () => {
        toast.success(
          revokeKey
            ? "Detached from the registry and API key forgotten"
            : "Detached from the registry"
        );
        setDetachMode(null);
      },
      onError: () => {
        toast.error("Could not detach this node. Please try again.");
      },
    });
  };

  const handleRevoke = () => {
    if (!nodeToRevoke) return;
    const { name, node_id } = nodeToRevoke;

    revokeNode.mutate(node_id, {
      onSuccess: () => {
        toast.success(`${name} revoked`);
        setNodeToRevoke(null);
      },
      onError: () => {
        toast.error(`Could not revoke ${name}. Please try again.`);
      },
    });
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Federation — Registered Nodes
            </h1>
          </div>

          {manifest && (
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm">
              <span className="size-2 rounded-full bg-emerald-500" />
              {manifest.node_name} · {manifest.node_role}
            </div>
          )}
        </div>

        {/* This node — the client-node side of the federation */}
        {manifest && (
          <ThisNodeCard
            manifest={manifest}
            selfNode={selfNode}
            onHeartbeat={handleHeartbeat}
            isHeartbeating={sendHeartbeat.isPending}
            onDetach={(revokeKey) =>
              setDetachMode(revokeKey ? "revoke-key" : "detach")
            }
            onRegister={openRegisterDialog}
          />
        )}

        {/* Stat tiles */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Registered Nodes" value={isLoading ? "—" : stats.total} />
          <StatTile
            label="Active"
            value={isLoading ? "—" : stats.active}
            tone="text-emerald-600 dark:text-emerald-400"
          />
          <StatTile
            label="Stale"
            value={isLoading ? "—" : stats.stale}
            tone="text-amber-600 dark:text-amber-400"
          />
          <StatTile
            label="Detached / Revoked"
            value={isLoading ? "—" : stats.inactive}
          />
        </div>

        {/* Table */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">All Nodes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            GET /nodes?include_inactive=true — includes detached/revoked rows,
            unlike the peer-facing view.
          </p>

          <Card className="mt-4 border-border/60 py-0 shadow-sm">
            <CardContent className="px-0">
              {isError ? (
                <div className="px-6 py-14 text-center">
                  <p className="text-sm font-medium text-destructive">
                    Failed to load registered nodes.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Check that the registry server is reachable, then try again.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => refetch()}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-6 text-[11px] uppercase tracking-wider">
                        Name
                      </TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">
                        Base URL
                      </TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">
                        Maintained By
                      </TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">
                        Last Heartbeat
                      </TableHead>
                      <TableHead className="px-6 text-[11px] uppercase tracking-wider">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {isLoading &&
                      Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={index} className="hover:bg-transparent">
                          <TableCell colSpan={6} className="px-6 py-5">
                            <div className="h-4 w-full animate-pulse rounded bg-muted" />
                          </TableCell>
                        </TableRow>
                      ))}

                    {!isLoading && nodes.length === 0 && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={6} className="px-6 py-14 text-center">
                          <p className="text-sm font-medium text-foreground">
                            No nodes have registered yet.
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            A client node appears here once it calls POST
                            /nodes/register against this server.
                          </p>
                        </TableCell>
                      </TableRow>
                    )}

                    {!isLoading &&
                      nodes.map((node) => {
                        const isRevoked = node.status === "revoked";
                        return (
                          <TableRow key={node.node_id}>
                            <TableCell
                              className={`px-6 py-4 font-medium ${
                                isRevoked
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {node.name}
                            </TableCell>
                            <TableCell className="py-4 font-mono text-xs text-muted-foreground">
                              {node.base_url}
                            </TableCell>
                            <TableCell className="py-4 text-sm text-muted-foreground">
                              {node.maintained_by || "—"}
                            </TableCell>
                            <TableCell className="py-4">
                              <StatusBadge status={node.status} />
                            </TableCell>
                            <TableCell className="py-4 text-sm text-muted-foreground">
                              {relativeTime(node.last_heartbeat_at)}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 rounded-full border-primary/40 px-3 text-xs text-primary hover:bg-primary/5 hover:text-primary"
                                  onClick={() =>
                                    setNodeToView({
                                      node_id: node.node_id,
                                      name: node.name,
                                    })
                                  }
                                >
                                  View
                                </Button>

                                {!isRevoked && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 rounded-full border-destructive/40 bg-destructive/5 px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => setNodeToRevoke(node)}
                                  >
                                    Revoke
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Node detail drawer */}
      <Sheet
        open={Boolean(nodeToView)}
        onOpenChange={(open) => {
          if (!open) setNodeToView(null);
        }}
      >
        <SheetContent className="w-full gap-0 p-0 sm:w-3/5 sm:max-w-none">
          {nodeToView && (
            <NodeDatasetsPanel key={nodeToView.node_id} node={nodeToView} />
          )}
        </SheetContent>
      </Sheet>

      {/* Register / re-register this node */}
      <Dialog
        open={isRegisterOpen}
        onOpenChange={(open) => {
          if (!open && !registerSelf.isPending) setIsRegisterOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Register this node with the registry</DialogTitle>
            <DialogDescription>
              The registry fetches the manifest URL itself before trusting
              anything this node claims, so that URL has to be reachable from
              the registry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="node-name" className="text-sm">
                Node name
              </Label>
              <Input
                id="node-name"
                value={registerName}
                onChange={(event) => setRegisterName(event.target.value)}
                placeholder="client-node-01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manifest-url" className="text-sm">
                Manifest URL
              </Label>
              <Input
                id="manifest-url"
                value={
                  manifest?.base_url ? `${manifest.base_url}/node/manifest` : ""
                }
                readOnly
                placeholder="http://node.example.org:8100/node/manifest"
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintained-by" className="text-sm">
                Maintained by (optional)
              </Label>
              <Input
                id="maintained-by"
                value={registerMaintainer}
                onChange={(event) => setRegisterMaintainer(event.target.value)}
                placeholder="ops@example.org"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Registering with{" "}
              <span className="font-mono">
                {manifest?.central_server_url ?? "—"}
              </span>
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRegisterOpen(false)}
              disabled={registerSelf.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegister}
              disabled={registerSelf.isPending || !registerName.trim()}
            >
              {registerSelf.isPending ? "Registering…" : "Register node"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detach confirmation */}
      <Dialog
        open={Boolean(detachMode)}
        onOpenChange={(open) => {
          if (!open && !detachSelf.isPending) setDetachMode(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {detachMode === "revoke-key"
                ? "Revoke this node's key and detach?"
                : "Detach this node from the registry?"}
            </DialogTitle>
            <DialogDescription>
              {detachMode === "revoke-key"
                ? "This node leaves the federation and its API key is forgotten. Rejoining means registering again."
                : "This node stops heartbeating and drops out of peer searches. Its API key is kept, so it can come back by heartbeating again."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetachMode(null)}
              disabled={detachSelf.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={detachMode === "revoke-key" ? "destructive" : "default"}
              onClick={handleDetach}
              disabled={detachSelf.isPending}
            >
              {detachSelf.isPending
                ? "Detaching…"
                : detachMode === "revoke-key"
                ? "Revoke & detach"
                : "Detach node"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirmation */}
      <Dialog
        open={Boolean(nodeToRevoke)}
        onOpenChange={(open) => {
          if (!open && !revokeNode.isPending) setNodeToRevoke(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Revoke {nodeToRevoke?.name}?</DialogTitle>
            <DialogDescription>
              This deletes the node&apos;s API key on this server. It stops
              heartbeating immediately and can only rejoin the federation by
              registering again. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNodeToRevoke(null)}
              disabled={revokeNode.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              disabled={revokeNode.isPending}
            >
              {revokeNode.isPending ? "Revoking…" : "Revoke node"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
