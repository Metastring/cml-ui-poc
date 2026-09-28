export type NodeStatus = "active" | "stale" | "detached" | "revoked";

export interface RegisteredNode {
  node_id: string;
  name: string;
  base_url: string;
  sparql_endpoint: string | null;
  geoserver_url: string | null;
  maintained_by: string | null;
  status: NodeStatus;
  registered_at: string;
  last_heartbeat_at: string | null;
  metadata?: Record<string, unknown>;
}

export interface RegisteredNodesResponse {
  nodes: RegisteredNode[];
}

export interface NodeManifest {
  node_id: string;
  node_name: string;
  node_role: string;
  base_url: string;
  sparql_endpoint: string | null;
  geoserver_url: string | null;
  central_server_url: string | null;
  version: string;
  dataset_count: number;
  ontology_count: number;
  generated_at: string;
}

export interface RevokeNodeResponse {
  node_id: string;
  status: NodeStatus;
}
