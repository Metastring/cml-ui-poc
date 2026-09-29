"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, getClassDetail, listTreeLevel } from "../api/ontologyApi";
import type {
  OntologyClass,
  OntologyListItem,
  OntologySource,
  OntologyVersion,
  PredefinedSummary,
} from "../apiTypes";
import type { BuilderAction, ClassDetail, ClassSearchHit, TabId, TreeRow } from "../types";
import { errorMessage, vocabularyHint } from "../utils";

/**
 * Owns every piece of Ontology page state and all calls to `api`.
 * The components below it are presentational — they take values and callbacks.
 *
 * A predefined ontology is read-only: it has no versions and no builder
 * endpoints, so the mutations below all bail out on one.
 */
export function useOntologyBuilder() {
  const [ontologies, setOntologies] = useState<OntologyListItem[]>([]);
  const [graphKey, setGraphKey] = useState<string | null>(null);
  const [summary, setSummary] = useState<PredefinedSummary | null>(null);
  const [versions, setVersions] = useState<OntologyVersion[]>([]);
  const [tree, setTree] = useState<TreeRow[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [detail, setDetail] = useState<ClassDetail | null>(null);
  const [tab, setTab] = useState<TabId>("details");
  const [busy, setBusy] = useState<BuilderAction | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHits, setSearchHits] = useState<ClassSearchHit[] | null>(null);

  const ontology = useMemo(
    () => ontologies.find((o) => o.graph_key === graphKey) ?? null,
    [ontologies, graphKey],
  );

  /**
   * Which read API answers for the selection. Kept as a primitive so the load
   * effect below re-runs when the *selection* changes, not whenever the rail
   * list is refreshed.
   */
  const source: OntologySource | null = ontology?.source ?? null;
  const isPredefined = source === "predefined";

  /** Every class name in the loaded tree — the range/target dropdowns use it. */
  const classNames = useMemo(
    () => tree.flatMap((r) => (r.kind === "class" ? [r.node.name] : [])),
    [tree],
  );

  const latestVersion = versions[0]?.version_no ?? null;

  /** Guide §5.4: an empty tree is normal for a vocabulary; say so. */
  const treeHint = useMemo(
    () => (tree.length === 0 && !loading ? vocabularyHint(summary) : null),
    [tree.length, loading, summary],
  );

  /* ---------------- loading ---------------- */

  const loadOntologies = useCallback(async () => {
    try {
      /**
       * Guide §2: the catalogue is the only list with both kinds; the builder
       * list adds the full record for the editable ones. Merged so the rail can
       * show everything while the header keeps acronym / publish dates.
       */
      const [catalogue, builder] = await Promise.all([api.listCatalogue(), api.listOntologies()]);
      const record = new Map(builder.items.map((o) => [o.graph_key, o]));

      /**
       * Guide §2, known backend issue: a *published* custom ontology is listed
       * twice, once per source. De-dupe by graph_key and keep the `custom` row,
       * which is the editable draft.
       */
      const byKey = new Map<string, OntologyListItem>();
      for (const item of catalogue.items) {
        if (item.source === "predefined" && byKey.has(item.graph_key)) continue;
        byKey.set(item.graph_key, { ...record.get(item.graph_key), ...item });
      }
      const items = [...byKey.values()];
      setOntologies(items);

      /* Open on something editable — the predefined entries sort first. */
      const first = items.find((o) => o.source === "custom") ?? items[0];
      setGraphKey((k) => k ?? first?.graph_key ?? null);
    } catch (e) {
      setNotice(errorMessage(e, "Could not load ontologies"));
    }
  }, []);

  useEffect(() => {
    void loadOntologies();
  }, [loadOntologies]);

  /**
   * Walks whichever lazy class endpoint owns this ontology, one level at a
   * time, and flattens the result. The "+ Add subclass" rows only go in for a
   * custom draft — a predefined ontology cannot be edited.
   */
  const loadTree = useCallback(async (key: string, src: OntologySource, open: Set<string>) => {
    const rows: TreeRow[] = [];
    const walk = async (parent: string | undefined, depth: number) => {
      const items = await listTreeLevel(src, key, parent);
      for (const item of items) {
        rows.push({ kind: "class", depth, node: { ...item, depth } });
        if (item.has_children && open.has(item.name)) {
          await walk(item.name, depth + 1);
          if (src === "custom") rows.push({ kind: "add", parent: item.name, depth: depth + 1 });
        }
      }
    };
    await walk(undefined, 0);
    setTree(rows);
  }, []);

  /* Switching ontology resets the whole right-hand side. */
  useEffect(() => {
    if (!graphKey || !source) return;
    /* Guards against a slow response for the ontology the user just left. */
    let cancelled = false;
    const open = new Set<string>();
    setExpanded(open);
    setSelectedClass(null);
    setDetail(null);
    setVersions([]);
    setTree([]);
    setSummary(null);
    setSearchQuery("");
    setSearchHits(null);
    setTab("details");
    setLoading(true);

    void (async () => {
      try {
        let top: OntologyClass[];
        if (source === "predefined") {
          /**
           * Guide §5.2: a cold large ontology (DOID ≈ 20 s) is parsed on the
           * first read, so ask for the summary on its own and only then the
           * tree — firing both at once doubles the wait.
           */
          const s = await api.getSummary(graphKey);
          if (cancelled) return;
          setSummary(s);
          top = await listTreeLevel("predefined", graphKey);
        } else {
          /* Versions and classes are both cheap for a draft. */
          const [versionsRes, classes] = await Promise.all([
            api.listVersions(graphKey),
            listTreeLevel("custom", graphKey),
          ]);
          if (cancelled) return;
          setVersions(versionsRes.items);
          top = classes;
        }
        if (cancelled) return;

        const first = top.find((i) => i.has_children) ?? top[0];
        if (first?.has_children) open.add(first.name);
        setExpanded(new Set(open));
        await loadTree(graphKey, source, open);
        if (cancelled) return;
        setSelectedClass(first?.children?.[0] ?? first?.name ?? null);
      } catch (e) {
        if (!cancelled) setNotice(errorMessage(e, "Could not load this ontology"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [graphKey, source, loadTree]);

  const refreshDetail = useCallback(async () => {
    if (!graphKey || !source || !selectedClass) {
      setDetail(null);
      return;
    }
    try {
      setDetail(await getClassDetail(source, graphKey, selectedClass));
    } catch (e) {
      setDetail(null);
      setNotice(errorMessage(e, "Could not load class details"));
    }
  }, [graphKey, source, selectedClass]);

  useEffect(() => {
    void refreshDetail();
  }, [refreshDetail]);

  /* ---------------- mutations ---------------- */

  const toggleExpanded = useCallback(
    (name: string) => {
      const open = new Set(expanded);
      if (open.has(name)) open.delete(name);
      else open.add(name);
      setExpanded(open);
      if (graphKey && source) void loadTree(graphKey, source, open);
    },
    [expanded, graphKey, source, loadTree],
  );

  /**
   * Guide §3.5: search exists for predefined ontologies only. It is the only
   * practical way into something like DOID (12,282 classes), so the tree shows
   * a flat hit list while a query is active.
   */
  const runSearch = useCallback(
    async (q: string) => {
      setSearchQuery(q);
      if (!graphKey || source !== "predefined" || q.trim().length < 2) {
        setSearchHits(null);
        return;
      }
      try {
        const r = await api.searchClasses(graphKey, q.trim());
        setSearchHits(r.classes.map((c) => ({ name: c.name, label: c.label || c.name })));
      } catch (e) {
        setSearchHits(null);
        setNotice(errorMessage(e, "Search failed"));
      }
    },
    [graphKey, source],
  );

  const createClass = useCallback(
    async (name: string, parent: string | null) => {
      if (!graphKey || source !== "custom") return;
      try {
        await api.createClass(graphKey, { name, label: name, parent_name: parent });
        const open = new Set(expanded);
        if (parent) open.add(parent);
        setExpanded(open);
        await loadTree(graphKey, source, open);
        await loadOntologies();
        setSelectedClass(name);
      } catch (e) {
        setNotice(errorMessage(e, "Could not add class"));
      }
    },
    [graphKey, source, expanded, loadTree, loadOntologies],
  );

  const createProperty = useCallback(
    async (input: { kind: "datatype" | "object"; name: string; range: string; cardinality: string }) => {
      if (!graphKey || !selectedClass || isPredefined) return false;
      try {
        await api.createProperty(graphKey, selectedClass, {
          name: input.name.trim(),
          label: input.name.trim(),
          property_type: input.kind,
          range_value: input.range,
          cardinality_note: input.cardinality.trim() || null,
        });
        await refreshDetail();
        return true;
      } catch (e) {
        setNotice(errorMessage(e, "Could not add property"));
        return false;
      }
    },
    [graphKey, selectedClass, isPredefined, refreshDetail],
  );

  const createMapping = useCallback(
    async (input: {
      relation: Parameters<typeof api.createMapping>[2]["relation"];
      target_kind: Parameters<typeof api.createMapping>[2]["target_kind"];
      to_class_name: string;
      to_ontology_graph_key: string;
      to_ref: string;
    }) => {
      if (!graphKey || !selectedClass || isPredefined) return false;
      try {
        await api.createMapping(graphKey, selectedClass, {
          relation: input.relation,
          target_kind: input.target_kind,
          to_class_name: input.to_class_name || undefined,
          to_ontology_graph_key: input.to_ontology_graph_key || undefined,
          to_ref: input.to_ref || undefined,
        });
        await refreshDetail();
        return true;
      } catch (e) {
        setNotice(errorMessage(e, "Could not add mapping"));
        return false;
      }
    },
    [graphKey, selectedClass, isPredefined, refreshDetail],
  );

  const deleteMapping = useCallback(
    async (mappingId: number) => {
      if (!graphKey || isPredefined) return;
      try {
        await api.deleteMapping(graphKey, mappingId);
        await refreshDetail();
      } catch (e) {
        setNotice(errorMessage(e, "Could not remove mapping"));
      }
    },
    [graphKey, isPredefined, refreshDetail],
  );

  const runAction = useCallback(
    async (kind: BuilderAction) => {
      /* Validate / version / publish are builder-only endpoints. */
      if (!graphKey || isPredefined) return;
      setBusy(kind);
      try {
        if (kind === "validate") {
          const r = await api.validate(graphKey);
          setNotice(`Valid · ${r.triple_count} triples · ${r.class_count} classes`);
        } else if (kind === "version") {
          const v = await api.createVersion(graphKey);
          setVersions((await api.listVersions(graphKey)).items);
          setNotice(`Saved version v${v.version_no}`);
        } else {
          const r = await api.publish(graphKey);
          await loadOntologies();
          setNotice(`Published · ${r.triple_count} triples → ${r.fuseki.graph_uri}`);
        }
      } catch (e) {
        setNotice(errorMessage(e, "Action failed"));
      } finally {
        setBusy(null);
      }
    },
    [graphKey, isPredefined, loadOntologies],
  );

  /** Called after the create-ontology modal succeeds. */
  const selectNewOntology = useCallback(
    async (key: string) => {
      await loadOntologies();
      setGraphKey(key);
    },
    [loadOntologies],
  );

  return {
    // data
    ontologies,
    ontology,
    graphKey,
    source,
    isPredefined,
    summary,
    tree,
    treeHint,
    expanded,
    classNames,
    selectedClass,
    detail,
    latestVersion,
    tab,
    busy,
    loading,
    notice,
    searchQuery,
    searchHits,
    // actions
    setGraphKey,
    setSelectedClass,
    setTab,
    setNotice,
    toggleExpanded,
    runSearch,
    createClass,
    createProperty,
    createMapping,
    deleteMapping,
    runAction,
    selectNewOntology,
  };
}

export type OntologyBuilderState = ReturnType<typeof useOntologyBuilder>;
