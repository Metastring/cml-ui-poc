import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetNodeRegistryBaseApiHandler,
  PostNodeRegistryBaseApiHandler,
} from "./NodeRegistryBaseApiHandler";
import {
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
