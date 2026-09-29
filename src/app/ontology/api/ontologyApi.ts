/**
 * The single seam between the Ontology page UI and its backend.
 *
 * There are two kinds of ontology and each has its own read API (see the
 * "Ontology API — Frontend Guide", §1):
 *   - custom drafts   → `/ontology/builder/*`  (read AND write)
 *   - predefined TTLs → `/ontology/*`, `/ontology/v3/*` (read only)
 * The catalogue that lists both lives under `/dataset-ontology-mapping`.
 *
 * `api` holds the raw 1:1 endpoint methods. Below it, the normalisers and the
 * `listTreeLevel` / `getClassDetail` readers hide the shape difference, so
 * nothing above this file knows about HTTP or about which kind it is showing.
 */
import type {
  CreateClassBody,
  CreateMappingBody,
  CreateOntologyBody,
  CreatePropertyBody,
  Ontology,
  OntologyCatalogueItem,
  OntologyClass,
  OntologyMapping,
  OntologyProperty,
  OntologySearchResult,
  OntologySource,
  OntologyVersion,
  OntologyVersionDetail,
  PatchClassBody,
  PatchOntologyBody,
  PredefinedClass,
  PredefinedProperty,
  PredefinedSummary,
  PredefinedTreeClass,
  PublishResponse,
  ValidateResponse,
} from "../apiTypes";
import { displayCurie } from "../apiTypes";
import type { ClassDetail, TaggedProperty } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_ONTOLOGY_BASE_URL;
const ROOT = "/ontology/builder";
/** The predefined readers and the catalogue sit outside the builder root. */
const ONTOLOGY_ROOT = "/ontology";
const MAPPING_ROOT = "/dataset-ontology-mapping";

/**
 * Guide §5.2: the first read of a large predefined ontology parses the TTL on
 * the server — DOID takes ~20 s — so the ceiling has to be generous. Without a
 * signal a hung request would spin forever instead of surfacing an error.
 */
const TIMEOUT_MS = 90_000;

/** Carries the HTTP status so callers can tell a 409 duplicate from a 400 pattern failure. */
export class OntologyApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "OntologyApiError";
  }
}

/** FastAPI puts the readable message in `detail` — a string, or a list for 422s. */
function detailMessage(body: unknown, fallback: string): string {
  if (typeof body === "string" && body.trim()) return body;
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail)) {
      const parts = detail
        .map((d) => (d && typeof d === "object" && "msg" in d ? String((d as { msg: unknown }).msg) : null))
        .filter(Boolean);
      if (parts.length) return parts.join("; ");
    }
  }
  return fallback;
}

/**
 * Guide §5.3: class names are CURIEs ("sosa:Sensor") or, where the ontology has
 * no named prefix, full IRIs. Both have to be encoded in paths and in `parent=`.
 */
const seg = (value: string | number) => encodeURIComponent(String(value));

/** Guide §5.1: `graph_key` is a required *query* param on every predefined read. */
const qs = (params: Record<string, string | undefined>) => {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) q.set(key, value);
  const s = q.toString();
  return s ? `?${s}` : "";
};

async function request<T>(path: string, init?: RequestInit, root: string = ROOT): Promise<T> {
  if (!BASE_URL) {
    throw new OntologyApiError(0, "NEXT_PUBLIC_ONTOLOGY_BASE_URL is not configured");
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${root}${path}`, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json", ...init?.headers } : init?.headers,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    const timedOut = e instanceof DOMException && e.name === "TimeoutError";
    throw new OntologyApiError(
      0,
      timedOut ? "The ontology service took too long to respond" : "Could not reach the ontology service",
    );
  }

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    throw new OntologyApiError(res.status, detailMessage(parsed, `Request failed (${res.status})`));
  }
  return parsed as T;
}

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  /* ---------- Rail & header ---------- */

  /**
   * GET /dataset-ontology-mapping/ontologies — guide §2: the only list holding
   * both kinds. `/ontology/ttl` and `/ontology/builder` are each partial.
   */
  listCatalogue(): Promise<{ items: OntologyCatalogueItem[] }> {
    return request("/ontologies", undefined, MAPPING_ROOT);
  },

  /** GET /ontology/builder — the full record for each ontology built here */
  listOntologies(): Promise<{ items: (Ontology & { class_count: number })[] }> {
    return request("");
  },

  /* ---------- Predefined ontologies (read-only) ---------- */

  /** GET /ontology/summary — call this FIRST for a cold ontology (guide §5.2) */
  getSummary(graphKey: string): Promise<PredefinedSummary> {
    return request(`/summary${qs({ graph_key: graphKey })}`, undefined, ONTOLOGY_ROOT);
  },

  /** GET /ontology/v3/classes[?parent=CURIE] — lazy, one level. Guide §3.2 */
  listPredefinedClasses(
    graphKey: string,
    parent?: string,
  ): Promise<{ graph_key: string; parent: string | null; count: number; items: PredefinedTreeClass[] }> {
    return request(
      `/v3/classes${qs({ graph_key: graphKey, parent })}`,
      undefined,
      ONTOLOGY_ROOT,
    );
  },

  /** GET /ontology/classes/{class_name} — whole detail panel. Guide §3.4 */
  getPredefinedClass(graphKey: string, name: string): Promise<PredefinedClass> {
    return request(`/classes/${seg(name)}${qs({ graph_key: graphKey })}`, undefined, ONTOLOGY_ROOT);
  },

  /** GET /ontology/search — predefined only; there is no search for drafts (guide §3.5) */
  searchClasses(graphKey: string, q: string): Promise<OntologySearchResult> {
    return request(`/search${qs({ graph_key: graphKey, q })}`, undefined, ONTOLOGY_ROOT);
  },

  /** GET /ontology/builder/{graph_key} */
  getOntology(graphKey: string): Promise<Ontology> {
    return request(`/${seg(graphKey)}`);
  },

  /** POST /ontology/builder */
  createOntology(body: CreateOntologyBody): Promise<Ontology> {
    return request("", { method: "POST", body: json(body) });
  },

  /** PATCH /ontology/builder/{graph_key} — send only what changed */
  patchOntology(graphKey: string, body: PatchOntologyBody): Promise<Ontology> {
    return request(`/${seg(graphKey)}`, { method: "PATCH", body: json(body) });
  },

  /** DELETE /ontology/builder/{graph_key} */
  deleteOntology(graphKey: string): Promise<void> {
    return request(`/${seg(graphKey)}`, { method: "DELETE" });
  },

  /* ---------- Toolbar actions ---------- */

  /** POST /ontology/builder/{graph_key}/validate */
  validate(graphKey: string): Promise<ValidateResponse> {
    return request(`/${seg(graphKey)}/validate`, { method: "POST" });
  },

  /** POST /ontology/builder/{graph_key}/publish — async on the server, show a spinner */
  publish(graphKey: string): Promise<PublishResponse> {
    return request(`/${seg(graphKey)}/publish`, { method: "POST" });
  },

  /** POST /ontology/builder/{graph_key}/versions — takes no body */
  createVersion(graphKey: string): Promise<OntologyVersion> {
    return request(`/${seg(graphKey)}/versions`, { method: "POST" });
  },

  /** GET /ontology/builder/{graph_key}/versions */
  listVersions(graphKey: string): Promise<{ items: OntologyVersion[] }> {
    return request(`/${seg(graphKey)}/versions`);
  },

  /** GET /ontology/builder/{graph_key}/versions/{version_no} */
  getVersion(graphKey: string, versionNo: number): Promise<OntologyVersionDetail> {
    return request(`/${seg(graphKey)}/versions/${seg(versionNo)}`);
  },

  /** GET /ontology/builder/{graph_key}/ttl — plain text, not JSON */
  getTtl(graphKey: string): Promise<string> {
    return request(`/${seg(graphKey)}/ttl`);
  },

  /* ---------- Class tree ---------- */

  /** GET /ontology/builder/{graph_key}/classes[?parent=Name] — lazy, one level */
  listClasses(
    graphKey: string,
    parent?: string,
  ): Promise<{ parent: string | null; count: number; items: OntologyClass[] }> {
    const query = parent ? `?parent=${encodeURIComponent(parent)}` : "";
    return request(`/${seg(graphKey)}/classes${query}`);
  },

  /** GET /ontology/builder/{graph_key}/classes/{name} — whole detail panel */
  getClass(graphKey: string, name: string): Promise<OntologyClass> {
    return request(`/${seg(graphKey)}/classes/${seg(name)}`);
  },

  /** POST /ontology/builder/{graph_key}/classes — parent_name null = top level */
  createClass(graphKey: string, body: CreateClassBody): Promise<OntologyClass> {
    return request(`/${seg(graphKey)}/classes`, { method: "POST", body: json(body) });
  },

  /** PATCH /ontology/builder/{graph_key}/classes/{name} — re-parent / rename label */
  patchClass(graphKey: string, name: string, body: PatchClassBody): Promise<OntologyClass> {
    return request(`/${seg(graphKey)}/classes/${seg(name)}`, { method: "PATCH", body: json(body) });
  },

  /** DELETE /ontology/builder/{graph_key}/classes/{name} — 409 if it still has subclasses */
  deleteClass(graphKey: string, name: string): Promise<void> {
    return request(`/${seg(graphKey)}/classes/${seg(name)}`, { method: "DELETE" });
  },

  /* ---------- Properties ---------- */

  /** POST /ontology/builder/{graph_key}/classes/{name}/properties */
  createProperty(
    graphKey: string,
    className: string,
    body: CreatePropertyBody,
  ): Promise<OntologyProperty> {
    return request(`/${seg(graphKey)}/classes/${seg(className)}/properties`, {
      method: "POST",
      body: json(body),
    });
  },

  /** DELETE /ontology/builder/{graph_key}/properties/{name} — scoped by property name only */
  deleteProperty(graphKey: string, name: string): Promise<void> {
    return request(`/${seg(graphKey)}/properties/${seg(name)}`, { method: "DELETE" });
  },

  /* ---------- Mappings ---------- */

  /** POST /ontology/builder/{graph_key}/classes/{name}/mappings */
  createMapping(
    graphKey: string,
    className: string,
    body: CreateMappingBody,
  ): Promise<OntologyMapping> {
    return request(`/${seg(graphKey)}/classes/${seg(className)}/mappings`, {
      method: "POST",
      body: json(body),
    });
  },

  /** DELETE /ontology/builder/{graph_key}/mappings/{mapping_id} */
  deleteMapping(graphKey: string, mappingId: number): Promise<void> {
    return request(`/${seg(graphKey)}/mappings/${seg(mappingId)}`, { method: "DELETE" });
  },
};

/* ============================================================
 * Normalisers — guide §3.3 asks for exactly one of these so the tree and the
 * detail panel take a single shape. The builder's shape wins, because that is
 * the one the components were already written against.
 *
 *   predefined          →  builder
 *   comment             →  definition
 *   parents: []         →  parent_name
 *   ranges: []          →  range_value
 *   domains: []         →  domain_class_name
 * ========================================================== */

const normaliseProperty = (p: PredefinedProperty): OntologyProperty => ({
  name: p.name,
  label: p.label || p.name,
  property_type: p.property_type,
  /* A predefined property can have several ranges; the builder allows one. */
  range_value: p.ranges.join(", ") || "—",
  /** Predefined TTLs carry no cardinality note. */
  cardinality_note: null,
  domain_class_name: p.domains[0] ?? "",
});

const normaliseTreeClass = (c: PredefinedTreeClass): OntologyClass => ({
  name: c.name,
  label: c.label || c.name,
  definition: c.comment,
  /* No synonyms or mappings in the predefined readers — the tabs show "—". */
  synonyms: [],
  parent_name: c.parents[0] ?? null,
  children: c.children,
  has_children: c.has_children,
  datatype_properties: c.datatype_properties.map(normaliseProperty),
  object_properties: c.object_properties.map(normaliseProperty),
  mappings: [],
});

const normalisePredefinedClass = (c: PredefinedClass): OntologyClass & { iri: string } => ({
  name: c.name,
  iri: c.iri,
  label: c.label || c.name,
  definition: c.comment,
  synonyms: [],
  parent_name: c.parents[0] ?? null,
  children: c.children,
  has_children: c.children.length > 0,
  datatype_properties: c.datatype_properties.map(normaliseProperty),
  /* Only outgoing: an incoming property is declared on ANOTHER class and
     merely points here, so listing it as this class's own would be wrong. */
  object_properties: c.outgoing_object_properties.map(normaliseProperty),
  mappings: [],
});

/** One tree level, from whichever backend owns this ontology. */
export async function listTreeLevel(
  source: OntologySource,
  graphKey: string,
  parent?: string,
): Promise<OntologyClass[]> {
  if (source === "custom") return (await api.listClasses(graphKey, parent)).items;
  return (await api.listPredefinedClasses(graphKey, parent)).items.map(normaliseTreeClass);
}

/**
 * Gap #2: neither reader returns inherited properties — verified on dcat3,
 * where dcat:Dataset omits dcat:Resource's own properties. So walk
 * `parent_name` upward, merge the ancestors' lists in, and tag the non-own
 * ones so the Properties tab can label them "from X".
 */
export async function getClassDetail(
  source: OntologySource,
  graphKey: string,
  name: string,
): Promise<ClassDetail> {
  const fetchOne = async (n: string): Promise<OntologyClass & { iri?: string }> =>
    source === "custom"
      ? api.getClass(graphKey, n)
      : normalisePredefinedClass(await api.getPredefinedClass(graphKey, n));

  const own = await fetchOne(name);
  const tag = (list: OntologyProperty[], from: string | null): TaggedProperty[] =>
    list.map((p) => ({ ...p, inherited_from: from }));

  const datatype: TaggedProperty[] = tag(own.datatype_properties ?? [], null);
  const object: TaggedProperty[] = tag(own.object_properties ?? [], null);

  /* `seen` guards against a malformed cycle in parent_name hanging the walk. */
  const seen = new Set<string>([own.name]);
  let parent = own.parent_name;
  while (parent && !seen.has(parent)) {
    seen.add(parent);
    const p = await fetchOne(parent);
    datatype.push(...tag(p.datatype_properties ?? [], p.name));
    object.push(...tag(p.object_properties ?? [], p.name));
    parent = p.parent_name;
  }

  return {
    ...own,
    datatype_properties: datatype,
    object_properties: object,
    source,
    curie: displayCurie(own.name, source),
    parent_curie: own.parent_name ? displayCurie(own.parent_name, source) : null,
  };
}

export type OntologyApi = typeof api;
