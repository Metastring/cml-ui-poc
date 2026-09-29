"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import BuilderHeader from "./components/BuilderHeader";
import OntologyRail from "./components/OntologyRail";
import ClassTree from "./components/ClassTree";
import ClassDetailPanel from "./components/ClassDetailPanel";
import { useOntologyBuilder } from "./hooks/useOntologyBuilder";

/** Split out: the modal is only needed once the user clicks "+ New ontology". */
const CreateOntologyModal = dynamic(() => import("./components/CreateOntologyModal"), { ssr: false });

export default function OntologyBuilder() {
  const b = useOntologyBuilder();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex h-screen min-h-0 flex-col bg-[#FCFCF9] text-[#26292A]">
      <BuilderHeader
        ontology={b.ontology}
        latestVersion={b.latestVersion}
        readOnly={b.isPredefined}
        summary={b.summary}
        busy={b.busy}
        notice={b.notice}
        onDismissNotice={() => b.setNotice(null)}
        onNewOntology={() => setCreateOpen(true)}
        onAction={(kind) => void b.runAction(kind)}
        /* Go back to something editable, not whichever entry happens to be first. */
        onHome={() =>
          b.setGraphKey(
            (b.ontologies.find((o) => o.source === "custom") ?? b.ontologies[0])?.graph_key ?? null,
          )
        }
      />

      <div className="flex min-h-0 flex-1">
        <OntologyRail ontologies={b.ontologies} graphKey={b.graphKey} onSelect={b.setGraphKey} />

        <ClassTree
          rows={b.tree}
          expanded={b.expanded}
          selectedClass={b.selectedClass}
          readOnly={b.isPredefined}
          loading={b.loading}
          hint={b.treeHint}
          search={{
            enabled: b.isPredefined,
            query: b.searchQuery,
            hits: b.searchHits,
            onQueryChange: (q) => void b.runSearch(q),
          }}
          onSelect={b.setSelectedClass}
          onToggle={b.toggleExpanded}
          onCreate={(name, parent) => void b.createClass(name, parent)}
        />

        <ClassDetailPanel
          /* Re-keyed so a half-filled add form never leaks across classes. */
          key={`${b.graphKey}:${b.selectedClass}`}
          detail={b.detail}
          tab={b.tab}
          onTabChange={b.setTab}
          onSelectClass={b.setSelectedClass}
          ontologies={b.ontologies}
          graphKey={b.graphKey}
          readOnly={b.isPredefined}
          classNames={b.classNames}
          onCreateProperty={b.createProperty}
          onCreateMapping={b.createMapping}
          onDeleteMapping={(id) => void b.deleteMapping(id)}
        />
      </div>

      {createOpen && (
        <CreateOntologyModal
          onCancel={() => setCreateOpen(false)}
          onCreated={async (key) => {
            setCreateOpen(false);
            await b.selectNewOntology(key);
          }}
        />
      )}
    </div>
  );
}
