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
  /**
   * Whether this node currently holds a registry entry. The authoritative
   * signal — `central_server_url` is static config and stays set either way.
   */
  registered: boolean;
  /** This node's registry id while registered, null once detached or revoked. */
  member_id: string | null;
  version: string;
  dataset_count: number;
  ontology_count: number;
  generated_at: string;
}

/**
 * POST /node/self/register — the self route derives this node's manifest URL
 * itself and keeps the issued key server-side, so no api_key comes back.
 */
export interface RegisterSelfInput {
  name?: string | null;
  maintained_by?: string | null;
}

export interface RegisterSelfResponse {
  node_id: string;
  status: NodeStatus;
}

export interface RevokeNodeResponse {
  node_id: string;
  status: NodeStatus;
}

/**
 * live: fetched from the node just now.
 * cache: the node was unreachable, so this is the last saved copy.
 * unavailable: the node was unreachable and there is no saved copy.
 */
export type DatasetsSource = "live" | "cache" | "unavailable";

export interface NodeDatasetField {
  field_name: string;
  ontology_mapping: string | null;
  ontology_mapping_to_display: string | null;
  data_type: string | null;
}

export interface NodeDataset {
  dataset_id: number;
  title: string;
  category: string | null;
  description: string | null;
  keywords: string | null;
  /** Approximate figure from Postgres statistics. */
  row_count: number | null;
  date_min: string | null;
  date_max: string | null;
  fields: NodeDatasetField[];
}

/** GET /nodes/{node_id}/datasets — `node_id` is a registry id or the literal `self`. */
export interface NodeDatasetsResponse {
  node: {
    node_id: string;
    name: string;
    base_url: string;
    /** `self` when queried with node_id=self. */
    status: NodeStatus | "self";
    is_self: boolean;
  };
  datasets_source: DatasetsSource;
  /** null for `self` and for `unavailable`. */
  harvested_at: string | null;
  dataset_count: number;
  datasets: NodeDataset[];
}

/** POST /nodes/{node_id}/heartbeat — what this node reports when it checks in. */
export interface HeartbeatInput {
  dataset_count: number | null;
  version: string | null;
}

export interface HeartbeatResponse {
  node_id: string;
  status: NodeStatus;
  last_heartbeat_at: string | null;
}

/** POST /nodes/self/detach — `revoke_key` also drops this node's API key. */
export interface DetachResponse {
  node_id: string;
  status: NodeStatus;
  key_revoked?: boolean;
}
