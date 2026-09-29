"use client";

import React from "react";
import { MonoChip } from "./Chips";
import DetailsTab from "./tabs/DetailsTab";
import PropertiesTab from "./tabs/PropertiesTab";
import MappingsTab from "./tabs/MappingsTab";
import type { OntologyListItem } from "../apiTypes";
import type { ClassDetail, MappingFormState, PropertyFormState, TabId } from "../types";

interface Props {
  detail: ClassDetail | null;
  tab: TabId;
  onTabChange: (tab: TabId) => void;
  onSelectClass: (name: string) => void;
  ontologies: OntologyListItem[];
  graphKey: string | null;
  /** A predefined class cannot be edited, so the add/remove controls are hidden. */
  readOnly: boolean;
  classNames: string[];
  onCreateProperty: (input: PropertyFormState) => Promise<boolean>;
  onCreateMapping: (input: MappingFormState) => Promise<boolean>;
  onDeleteMapping: (mappingId: number) => void;
}

export default function ClassDetailPanel({
  detail,
  tab,
  onTabChange,
  onSelectClass,
  ontologies,
  graphKey,
  readOnly,
  classNames,
  onCreateProperty,
  onCreateMapping,
  onDeleteMapping,
}: Props) {
  if (!detail) {
    return (
      <main className="min-h-0 flex-1 overflow-y-auto bg-white">
        <div className="px-6 py-8 text-sm text-[#8A8E84]">Select a class to see its details.</div>
      </main>
    );
  }

  const tabs: [TabId, string, number | null][] = [
    ["details", "Details", null],
    ["properties", "Properties", null],
    ["mappings", "Mappings", detail.mappings.length || null],
  ];

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-white">
      <div className="px-6 pt-6">
        <div className="flex items-center gap-1.5 text-sm">
          {detail.parent_name && (
            <>
              <button
                type="button"
                onClick={() => onSelectClass(detail.parent_name as string)}
                className="text-[#6E7268] hover:text-[#26292A]"
              >
                {detail.parent_name}
              </button>
              <span className="text-[#BFC2B8]">/</span>
            </>
          )}
          <span className="text-[#8A8E84]">{detail.name}</span>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <h2 className="text-[26px] font-bold leading-tight tracking-[-0.01em]">{detail.label}</h2>
          {/* Already normalised: "cphr:Plant" for a draft, "dcat:Dataset" for a predefined class. */}
          <MonoChip>{detail.curie}</MonoChip>
        </div>

        <p className="mt-2 max-w-[600px] text-[15px] leading-[1.55] text-[#3C4140]">{detail.definition}</p>

        <div className="mt-5 flex gap-8 border-b border-[#E6E6DE]">
          {tabs.map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`-mb-px border-b-2 pb-2.5 text-[15px] ${
                tab === id
                  ? "border-[#2F5C42] font-medium text-[#2F5C42]"
                  : "border-transparent text-[#6E7268] hover:text-[#26292A]"
              }`}
            >
              {label}
              {count !== null && <span className="text-[#9AA093]"> · {count}</span>}
            </button>
          ))}
        </div>
      </div>

      {tab === "details" && <DetailsTab detail={detail} onSelectClass={onSelectClass} />}
      {tab === "properties" && (
        <PropertiesTab
          detail={detail}
          readOnly={readOnly}
          classNames={classNames}
          onCreate={onCreateProperty}
        />
      )}
      {tab === "mappings" && (
        <MappingsTab
          detail={detail}
          ontologies={ontologies}
          graphKey={graphKey}
          readOnly={readOnly}
          classNames={classNames}
          onCreate={onCreateMapping}
          onDelete={onDeleteMapping}
        />
      )}
    </main>
  );
}
