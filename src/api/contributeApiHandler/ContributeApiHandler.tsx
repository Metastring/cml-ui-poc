import { useMutation, useQuery } from "@tanstack/react-query";
import {
  GetContributeBaseApiHandler,
  PatchContributeBaseApiHandler,
  PostContributeBaseApiHandler,
} from "./ContributeBaseApiHandler";
import {
  CreateDraftPayload,
  DatabaseReferencePayload,
  DraftResponse,
  FileReferencePayload,
  MapServiceReferencePayload,
  OntologyFieldOption,
  PublishResult,
  ReachabilityResult,
  SaveMappingsPayload,
  SuggestedField,
  UpdateDraftPayload,
  UrlReferencePayload,
} from "@/types/app/contribute.types";

/**
 * The ontology the mapping step maps against.
 * `/suggest` and `/mappings` both require a graph key; the wizard doesn't expose
 * a picker, so change this constant to switch ontologies.
 * Keys come from GET /dataset-ontology-mapping/ontologies.
 */
export const DEFAULT_ONTOLOGY_GRAPH_KEY = "envo";

/** Every mutation below acts on one draft registration. */
interface DatasetArg<T = void> {
  datasetId: string | number;
  params: T;
}

/* =========================================================
   RESPONSE READERS
   The registration endpoints are untyped in the OpenAPI spec, so responses are
   read by trying the likely keys rather than one assumed field name.
   ========================================================= */

type Loose = Record<string, unknown>;

const asRecord = (value: unknown): Loose =>
  value && typeof value === "object" ? (value as Loose) : {};

/** Merges `{ data: {...} }` / `{ result: {...} }` wrappers into one flat object. */
const flatten = (raw: unknown): Loose => {
  const body = asRecord(raw);
  const nested = asRecord(
    body.data ?? body.result ?? body.dataset ?? body.draft ?? body.verification
  );
  return { ...nested, ...body };
};

/** First key that holds a non-empty string or a number. */
const pickText = (source: Loose, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value) return value;
    if (typeof value === "number") return String(value);
  }
  return undefined;
};

/** First key that holds an array — or the response itself when it is one. */
const pickList = (raw: unknown, keys: string[]): Loose[] => {
  if (Array.isArray(raw)) return raw.map(asRecord);
  const body = asRecord(raw);
  for (const key of keys) {
    if (Array.isArray(body[key])) return (body[key] as unknown[]).map(asRecord);
  }
  return [];
};

const readDraft = (raw: unknown): DraftResponse => {
  const body = flatten(raw);
  return {
    dataset_id: pickText(body, ["dataset_id", "id", "datasetId"]) ?? "",
    raw: body,
  };
};

const readReachability = (raw: unknown): ReachabilityResult => {
  const body = flatten(raw);
  const columns = body.columns ?? body.header ?? body.column_names;
  const columnCount =
    typeof body.columns_detected === "number"
      ? body.columns_detected
      : typeof body.column_count === "number"
      ? body.column_count
      : Array.isArray(columns)
      ? columns.length
      : undefined;

  const flag = body.reachable ?? body.is_reachable ?? body.ok ?? body.success;
  const status = pickText(body, ["status", "state"]);

  return {
    reachable:
      typeof flag === "boolean"
        ? flag
        : status
        ? /ok|success|reachable|verified|connected/i.test(status)
        : columnCount !== undefined,
    columns_detected: columnCount,
    message: pickText(body, ["message", "detail", "error", "status"]),
  };
};

const readSuggestions = (raw: unknown): SuggestedField[] =>
  pickList(raw, ["items", "suggestions", "fields", "mappings", "results"]).map(
    (item) => ({
      field_name:
        pickText(item, ["field_name", "column", "column_name", "name"]) ?? "",
      sample_value:
        pickText(item, ["sample_value", "sample", "example", "value_sample"]) ??
        "",
      suggested_term: pickText(item, [
        "ontology_field",
        "suggested_field",
        "suggested_term",
        "suggestion",
        "ontology_mapping",
        "match",
      ]),
      confidence:
        typeof item.confidence === "number"
          ? item.confidence
          : typeof item.score === "number"
          ? item.score
          : undefined,
    })
  );

const readOntologyFields = (raw: unknown): OntologyFieldOption[] =>
  pickList(raw, ["items", "fields", "results"])
    .map((item) => {
      const value = pickText(item, ["value", "field", "uri", "name"]) ?? "";
      return { value, label: pickText(item, ["label", "title", "name"]) ?? value };
    })
    .filter((option) => option.value);

const readPublish = (raw: unknown): PublishResult => {
  const body = flatten(raw);
  return {
    status: pickText(body, [
      "status",
      "publish_status",
      "dataset_status",
      "state",
    ]),
    node_id: pickText(body, ["node_id", "node"]),
    dataset_id: pickText(body, ["dataset_id", "id"]),
    raw: body,
  };
};

/* =========================================================
   LOOKUPS
   ========================================================= */

/** GET /categories */
export const useGetCategories = () => {
  const { data, error, isLoading, isFetching, refetch, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: () => GetContributeBaseApiHandler("/categories"),
    staleTime: 1000 * 6000,
  });
  return { data, error, isLoading, isFetching, refetch, isError };
};

/** GET /dataset-ontology-mapping/ontologies/{graph_key}/fields */
export const useGetOntologyFields = (graphKey: string) => {
  const { data, error, isLoading, isFetching, refetch, isError } = useQuery({
    queryKey: ["ontology-fields", graphKey],
    queryFn: () =>
      GetContributeBaseApiHandler(
        `/dataset-ontology-mapping/ontologies/${graphKey}/fields`
      ),
    staleTime: 1000 * 6000,
    enabled: Boolean(graphKey),
  });

  return {
    data: readOntologyFields(data),
    error,
    isLoading,
    isFetching,
    refetch,
    isError,
  };
};

/* =========================================================
   STEP 1 — DATASET & NODE
   ========================================================= */

/** POST /dataset-registration/draft */
export const useCreateDraft = () =>
  useMutation<DraftResponse, Error, CreateDraftPayload>({
    mutationFn: async (params) =>
      readDraft(
        await PostContributeBaseApiHandler("/dataset-registration/draft", params)
      ),
  });

/** PATCH /dataset-registration/{dataset_id} */
export const useUpdateDraft = () =>
  useMutation<unknown, Error, DatasetArg<UpdateDraftPayload>>({
    mutationFn: ({ datasetId, params }) =>
      PatchContributeBaseApiHandler(
        `/dataset-registration/${datasetId}`,
        params
      ),
  });

/* =========================================================
   STEP 2 — DATA REFERENCE
   ========================================================= */

/** POST /dataset-registration/{dataset_id}/reference/file */
export const useSaveFileReference = () =>
  useMutation<unknown, Error, DatasetArg<FileReferencePayload>>({
    mutationFn: ({ datasetId, params }) =>
      PostContributeBaseApiHandler(
        `/dataset-registration/${datasetId}/reference/file`,
        params
      ),
  });

/** POST /dataset-registration/{dataset_id}/reference/file/verify */
export const useVerifyFileReference = () =>
  useMutation<ReachabilityResult, Error, { datasetId: string | number }>({
    mutationFn: async ({ datasetId }) =>
      readReachability(
        await PostContributeBaseApiHandler(
          `/dataset-registration/${datasetId}/reference/file/verify`
        )
      ),
  });

/** POST /dataset-registration/{dataset_id}/reference/url */
export const useSaveUrlReference = () =>
  useMutation<unknown, Error, DatasetArg<UrlReferencePayload>>({
    mutationFn: ({ datasetId, params }) =>
      PostContributeBaseApiHandler(
        `/dataset-registration/${datasetId}/reference/url`,
        params
      ),
  });

/** POST /dataset-registration/{dataset_id}/reference/database */
export const useSaveDatabaseReference = () =>
  useMutation<unknown, Error, DatasetArg<DatabaseReferencePayload>>({
    mutationFn: ({ datasetId, params }) =>
      PostContributeBaseApiHandler(
        `/dataset-registration/${datasetId}/reference/database`,
        params
      ),
  });

/** POST /dataset-registration/{dataset_id}/reference/database/verify */
export const useVerifyDatabaseReference = () =>
  useMutation<ReachabilityResult, Error, { datasetId: string | number }>({
    mutationFn: async ({ datasetId }) =>
      readReachability(
        await PostContributeBaseApiHandler(
          `/dataset-registration/${datasetId}/reference/database/verify`
        )
      ),
  });

/** POST /dataset-registration/{dataset_id}/reference/map-service */
export const useSaveMapServiceReference = () =>
  useMutation<unknown, Error, DatasetArg<MapServiceReferencePayload>>({
    mutationFn: ({ datasetId, params }) =>
      PostContributeBaseApiHandler(
        `/dataset-registration/${datasetId}/reference/map-service`,
        params
      ),
  });

/** POST /dataset-registration/{dataset_id}/reference/map-service/verify */
export const useVerifyMapServiceReference = () =>
  useMutation<ReachabilityResult, Error, { datasetId: string | number }>({
    mutationFn: async ({ datasetId }) =>
      readReachability(
        await PostContributeBaseApiHandler(
          `/dataset-registration/${datasetId}/reference/map-service/verify`
        )
      ),
  });

/* =========================================================
   STEP 3 — ONTOLOGY MAPPING
   ========================================================= */

/** POST /dataset-ontology-mapping/{dataset_id}/suggest?ontology_graph_key= */
export const useSuggestMappings = () =>
  useMutation<
    SuggestedField[],
    Error,
    { datasetId: string | number; graphKey: string }
  >({
    mutationFn: async ({ datasetId, graphKey }) =>
      readSuggestions(
        await PostContributeBaseApiHandler(
          `/dataset-ontology-mapping/${datasetId}/suggest?ontology_graph_key=${encodeURIComponent(
            graphKey
          )}`
        )
      ),
  });

/** POST /dataset-ontology-mapping/{dataset_id}/mappings */
export const useSaveMappings = () =>
  useMutation<unknown, Error, DatasetArg<SaveMappingsPayload>>({
    mutationFn: ({ datasetId, params }) =>
      PostContributeBaseApiHandler(
        `/dataset-ontology-mapping/${datasetId}/mappings`,
        params
      ),
  });

/** POST /ontology/terms/propose */
export const useProposeTerm = () =>
  useMutation<
    unknown,
    Error,
    {
      dataset_id: number;
      field_name: string;
      proposed_label: string;
      proposed_definition?: string;
      target_ontology_graph_key?: string;
    }
  >({
    mutationFn: (params) =>
      PostContributeBaseApiHandler("/ontology/terms/propose", params),
  });

/* =========================================================
   STEP 4 — REVIEW & PUBLISH
   ========================================================= */

/** GET /dataset-registration/{dataset_id}/review-summary */
export const useReviewSummary = () =>
  useMutation<Record<string, unknown>, Error, { datasetId: string | number }>({
    mutationFn: async ({ datasetId }) =>
      flatten(
        await GetContributeBaseApiHandler(
          `/dataset-registration/${datasetId}/review-summary`
        )
      ),
  });

/** POST /dataset-registration/{dataset_id}/publish */
export const usePublishDataset = () =>
  useMutation<PublishResult, Error, { datasetId: string | number }>({
    mutationFn: async ({ datasetId }) =>
      readPublish(
        await PostContributeBaseApiHandler(
          `/dataset-registration/${datasetId}/publish`
        )
      ),
  });
