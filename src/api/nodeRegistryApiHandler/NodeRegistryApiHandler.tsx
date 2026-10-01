import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetNodeRegistryBaseApiHandler,
  PostNodeRegistryBaseApiHandler,
} from "./NodeRegistryBaseApiHandler";
import {
  DetachResponse,
  HeartbeatInput,
  HeartbeatResponse,
  NodeDatasetsResponse,
  NodeManifest,
  RegisteredNodesResponse,
  RevokeNodeResponse,
} from "@/types/api/nodeRegistry.types";

/** This server's own identity — node_name / node_role for the page header pill. */
export const useGetNodeManifest = () => {
  const { data, error, isLoading, isError } = useQuery<NodeManifest>({
    queryKey: ["node-registry", "manifest"],
    queryFn: () => GetNodeRegistryBaseApiHandler(`/node/manifest`),
    staleTime: 1000 * 6000,
  });
  return { data, error, isLoading, isError };
};

/** Directory listing. Central needs the inactive rows too, and polls while open. */
export const useGetRegisteredNodes = () => {
  const { data, error, isLoading, isFetching, refetch, isError } =
    useQuery<RegisteredNodesResponse>({
      queryKey: ["node-registry", "nodes"],
      queryFn: () =>
        GetNodeRegistryBaseApiHandler(`/nodes?include_inactive=true`),
      refetchInterval: 60 * 1000,
    });
  return { data, error, isLoading, isFetching, refetch, isError };
};

/**
 * Datasets of one node, for the registry's detail drawer.
 * Pass null to stay idle until a node is picked.
 * A node that is down is not an error — it answers 200 with datasets_source
 * `cache` or `unavailable` — so this never polls and never retries.
 */
export const useGetNodeDatasets = (nodeId: string | null) => {
  const { data, error, isLoading, isError } = useQuery<NodeDatasetsResponse>({
    queryKey: ["node-registry", "datasets", nodeId],
    queryFn: () => GetNodeRegistryBaseApiHandler(`/nodes/${nodeId}/datasets`),
    enabled: Boolean(nodeId),
    retry: false,
  });
  return { data, error, isLoading, isError };
};

/** Central-admin force revoke. Takes no auth — the confirm dialog is the guard. */
export const useRevokeNode = () => {
  const queryClient = useQueryClient();

  return useMutation<RevokeNodeResponse, Error, string>({
    mutationFn: (nodeId) =>
      PostNodeRegistryBaseApiHandler(`/nodes/${nodeId}/revoke`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["node-registry", "nodes"] });
    },
  });
};

/**
 * This node checks in with central. The backend heartbeats on its own
 * schedule — this is the manual nudge behind "Send heartbeat now".
 */
export const useSendHeartbeat = () => {
  const queryClient = useQueryClient();

  return useMutation<
    HeartbeatResponse,
    Error,
    { nodeId: string; body: HeartbeatInput }
  >({
    mutationFn: ({ nodeId, body }) =>
      PostNodeRegistryBaseApiHandler(`/nodes/${nodeId}/heartbeat`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["node-registry", "nodes"] });
    },
  });
};

/**
 * This node takes itself out of the federation.
 * `revoke_key` true also drops its API key, so rejoining means registering again.
 */
export const useDetachSelf = () => {
  const queryClient = useQueryClient();

  return useMutation<DetachResponse, Error, boolean>({
    mutationFn: (revokeKey) =>
      PostNodeRegistryBaseApiHandler(`/nodes/self/detach`, {
        revoke_key: revokeKey,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["node-registry", "nodes"] });
      queryClient.invalidateQueries({ queryKey: ["node-registry", "manifest"] });
    },
  });
};
