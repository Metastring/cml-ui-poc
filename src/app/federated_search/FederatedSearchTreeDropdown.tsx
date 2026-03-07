"use client";

import React, { useState, useCallback, useId } from "react";
import { AlertCircle, ChevronDown, ChevronRight, Info, Loader2, Trash2, Database } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

// Types (local to federated search)
export type Metadata = { key: string; value: string };

export type ChildNode = {
  id: string;
  name: string;
  description?: string;
  metadata?: Metadata[];
};

export type Node = {
  id: string;
  name: string;
  children: ChildNode[];
};

export type SelectedShape = { parent: string; child: { name: string }[] }[];

interface FederatedSearchTreeDropdownProps {
  nodes: Node[];
  buttonLabel?: string;
  selected: SelectedShape;
  onChange: (selected: SelectedShape) => void;
  isLoading?: boolean;
  isError?: boolean;
}

function totalSelected(selected: SelectedShape): number {
  return selected.reduce((sum, s) => sum + s.child.length, 0);
}

const FederatedSearchTreeDropdown: React.FC<FederatedSearchTreeDropdownProps> = ({
  nodes,
  buttonLabel = "Datasets",
  selected,
  onChange,
  isLoading = false,
  isError = false,
}) => {
  const selectedCount = totalSelected(selected);
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>(() => ({}));
  const treeId = useId();

  const toggleNode = useCallback((id: string) => {
    setOpenNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const isChildSelected = useCallback(
    (parent: string, childId: string) =>
      selected.some(
        (s) =>
          s.parent === parent &&
          s.child.some((c) => c.name === childId)
      ),
    [selected]
  );

  const toggleChild = useCallback(
    (parent: string, child: ChildNode) => {
      const newSelected = [...selected];
      const parentIndex = newSelected.findIndex((s) => s.parent === parent);

      if (parentIndex >= 0) {
        const childIndex = newSelected[parentIndex].child.findIndex(
          (c) => c.name === child.name
        );
        if (childIndex >= 0) {
          newSelected[parentIndex].child.splice(childIndex, 1);
        } else {
          newSelected[parentIndex].child.push({ name: child.name });
        }
        if (newSelected[parentIndex].child.length === 0) {
          newSelected.splice(parentIndex, 1);
        }
      } else {
        newSelected.push({ parent, child: [{ name: child.name }] });
      }
      onChange(newSelected);
    },
    [selected, onChange]
  );

  const clearParentSelection = useCallback(
    (parent: string) => {
      onChange(selected.filter((s) => s.parent !== parent));
    },
    [selected, onChange]
  );

  const handleParentKeyDown = useCallback(
    (e: React.KeyboardEvent, nodeId: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleNode(nodeId);
      }
    },
    [toggleNode]
  );

  return (
    <div
      id={treeId}
      role="tree"
      aria-label="Tree selection"
      className="w-full min-w-[200px] max-w-[min(400px,100vw)] flex-1 min-h-0 flex flex-col border bg-popover text-popover-foreground shadow-md"
    >
      {/* Header: label + total selected count */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-muted/30 shrink-0">
        <span className="flex items-center gap-2 font-medium text-sm">
          <Database className="h-4 w-4 text-muted-foreground" />
          {buttonLabel}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {selectedCount > 0 ? (
            <span className="font-medium text-foreground">{selectedCount} selected</span>
          ) : (
            "0 selected"
          )}
        </span>
      </div>
      <div className="min-w-0 flex-1 overflow-auto p-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium text-foreground">
              Loading filters
            </p>
            <p className="text-xs text-muted-foreground max-w-[200px]">
              Fetching categories and options…
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-6 px-4 text-center rounded-md bg-destructive/5 border border-destructive/20">
            <AlertCircle className="h-8 w-8 text-destructive shrink-0" aria-hidden />
            <p className="text-sm font-medium text-destructive">
              Couldn&apos;t load filters
            </p>
            <p className="text-xs text-muted-foreground max-w-[220px]">
              The filter list couldn&apos;t be loaded. Check your connection or try again in a moment.
            </p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="py-6 px-4 text-center">
            <p className="text-sm text-muted-foreground">
              No filters available
            </p>
          </div>
        ) : (
          nodes.map((node, index) => {
            const parentSelection = selected.find((s) => s.parent === node.name);
            const selectedCount = parentSelection?.child.length ?? 0;
            const isExpanded = !!openNodes[node.id];

            return (
              <div key={node.id} className="w-full min-w-0">
                {index > 0 && (
                  <div className="border-t border-border my-2" aria-hidden />
                )}
                <div className="mb-2 w-full min-w-0">
                {/* Parent Row */}
                <div
                  role="treeitem"
                  aria-expanded={isExpanded}
                  aria-selected={selectedCount > 0}
                  tabIndex={0}
                  className="flex items-center justify-between gap-2 cursor-pointer min-w-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => toggleNode(node.id)}
                  onKeyDown={(e) => handleParentKeyDown(e, node.id)}
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span className="p-1 pointer-events-none" aria-hidden>
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </span>
                    <span className="font-medium truncate">{node.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      ({node.children.length} dataset{node.children.length !== 1 ? "s" : ""})
                    </span>
                    {selectedCount > 0 ? (
                      <span className="text-xs text-primary font-medium shrink-0">
                        · {selectedCount} selected
                      </span>
                    ) : null}
                  </div>

                  {parentSelection && (
                    <button
                      type="button"
                      className="text-destructive p-1 hover:bg-destructive/10 rounded shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearParentSelection(node.name);
                      }}
                      aria-label={`Clear selection for ${node.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Child Rows */}
                {isExpanded && (
                  <div
                    role="group"
                    aria-label={`${node.name} options`}
                    className="ml-3 mt-2 space-y-1 border-l-2 pl-4 border-muted animate-in fade-in-0 duration-150"
                  >
                  {node.children.length > 0 ? (
                    node.children.map((child) => (
                      <div
                        key={child.id}
                        className={`flex items-center justify-between gap-2 p-2 rounded-md border border-border transition-colors cursor-pointer min-w-0 ${
                          isChildSelected(node.name, child.name)
                            ? "bg-primary/10 hover:bg-primary/20"
                            : "hover:bg-accent"
                        }`}
                      >
                        <label
                          htmlFor={`chk-${child.id}`}
                          className="flex items-start gap-2 cursor-pointer flex-1 min-w-0"
                        >
                          <Checkbox
                            id={`chk-${child.id}`}
                            checked={isChildSelected(node.name, child.name)}
                            onCheckedChange={() => toggleChild(node.name, child)}
                            className="mt-0.5 shrink-0"
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium truncate">
                              {child.name}
                            </span>
                            {child.description && (
                              <span
                                className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap break-words overflow-hidden min-w-0"
                                title={child?.description}
                              >
                                {child.description}
                              </span>
                            )}
                          </div>
                        </label>

                        {child.metadata && child.metadata.length > 0 && (
                          <HoverCard openDelay={100} closeDelay={100}>
                            <HoverCardTrigger asChild>
                              <button
                                type="button"
                                className="p-1 rounded-full hover:bg-muted shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                aria-label={`View metadata for ${child.name}`}
                              >
                                <Info size={16} className="text-muted-foreground" />
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-fit p-3 rounded-xl shadow-lg border bg-card">
                              {child.metadata.map((m) => (
                                <div
                                  key={m.key}
                                  className="text-xs text-muted-foreground whitespace-pre-line"
                                >
                                  <strong>{m.key}</strong>: {m.value}
                                </div>
                              ))}
                            </HoverCardContent>
                          </HoverCard>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-xs text-muted-foreground italic">
                      No data found
                    </div>
                  )}
                  </div>
                )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FederatedSearchTreeDropdown;
