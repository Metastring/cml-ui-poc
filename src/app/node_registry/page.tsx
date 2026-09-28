"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetNodeManifest,
  useGetRegisteredNodes,
  useRevokeNode,
} from "@/api/nodeRegistryApiHandler/NodeRegistryApiHandler";
import { NodeStatus, RegisteredNode } from "@/types/api/nodeRegistry.types";

const STATUS_STYLES: Record<NodeStatus, string> = {
  active:
    "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  stale: "bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-500/20",
  detached: "bg-muted text-muted-foreground border-border",
  revoked: "bg-red-500/12 text-red-700 dark:text-red-400 border-red-500/20",
};

const StatusBadge = ({ status }: { status: NodeStatus }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
      STATUS_STYLES[status] ?? STATUS_STYLES.detached
    }`}
  >
    {status}
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

export default function NodeRegistryPage() {
  const { data: manifest } = useGetNodeManifest();
  const { data, isLoading, isError, refetch } = useGetRegisteredNodes();
  const revokeNode = useRevokeNode();

  const [nodeToRevoke, setNodeToRevoke] = useState<RegisteredNode | null>(null);

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
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Central&apos;s view of every node that has registered. Central never
              registers itself — client nodes call POST /nodes/register against
              this server.
            </p>
          </div>

          {manifest && (
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm">
              <span className="size-2 rounded-full bg-emerald-500" />
              {manifest.node_name} · {manifest.node_role}
            </div>
          )}
        </div>

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
                    Check that central is reachable, then try again.
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
                                    toast.info(
                                      "Node detail view is coming soon."
                                    )
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
