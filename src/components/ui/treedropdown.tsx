"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Info, Loader2, Trash } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

// Types
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

interface TreeDropdownProps {
  nodes: Node[];
  buttonLabel?: string;
  onChange?: (
    selected: { parent: string; child: { id: string; name: string }[] }[]
  ) => void;
  isLoading?: boolean;
  isError?: boolean;
}

const TreeDropdown: React.FC<TreeDropdownProps> = ({
  nodes,
  buttonLabel = "Select Items",
  onChange,
  isLoading = false,
  isError = false,
}) => {
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggleNode = (id: string) => {
    setOpenNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateSelection = (newSelected: Record<string, boolean>) => {
    setSelected(newSelected);
    if (!onChange) return;

    const result: { parent: string; child: { id: string; name: string }[] }[] =
      [];

    nodes.forEach((node) => {
      const childrenSelected = node.children
        .filter((c) => newSelected[c.id])
        .map((c) => ({ id: c.id, name: c.name }));

      if (childrenSelected.length > 0) {
        result.push({ parent: node.name, child: childrenSelected });
      }
    });

    onChange(result);
  };

  const toggleChild = (childId: string) => {
    const newSelected = { ...selected };
    newSelected[childId] = !newSelected[childId];
    updateSelection(newSelected);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[300px] justify-between">
          <div>
            {buttonLabel}
            {Object.values(selected).filter(Boolean).length > 0 && (
              <span className="ml-1 text-sm text-muted-foreground">
                ({Object.values(selected).filter(Boolean).length})
              </span>
            )}
          </div>

          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] max-h-[300px] overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="animate-spin h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-xs text-muted-foreground italic">
              Loading...
            </span>
          </div>
        ) : isError ? (
          <div className="p-2 text-xs text-red-500 italic text-center">
            Something went wrong
          </div>
        ) : nodes.length === 0 ? (
          <div className="p-2 text-xs text-muted-foreground italic">
            No items found
          </div>
        ) : (
          nodes.map((node) => (
            <div key={node.id} className="mb-2">
              {/* Parent Row */}
              <div className="flex items-center justify-between cursor-pointer">
                <div
                  className="flex items-center space-x-2"
                  onClick={() => toggleNode(node.id)} // toggles open/close
                >
                  <button className="p-1">
                    {openNodes[node.id] ? (
                      <ChevronDown size={16} className="cursor-pointer" />
                    ) : (
                      <ChevronRight size={16} className="cursor-pointer" />
                    )}
                  </button>
                  <span className="font-medium">{node.name}</span>

                  {/* Show count only if > 0 */}
                  {node.children.filter((c) => selected[c.id]).length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({node.children.filter((c) => selected[c.id]).length})
                    </span>
                  )}
                </div>

                {/* Trash Button */}
                {node.children.filter((c) => selected[c.id]).length > 0 && (
                  <button
                    className="text-red-500 p-1 hover:bg-red-100 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newSelected = { ...selected };
                      node.children.forEach((c) => delete newSelected[c.id]);
                      setSelected(newSelected);

                      if (onChange) {
                        const result = nodes
                          .map((n) => ({
                            parent: n.name,
                            child: n.children
                              .filter((c) => newSelected[c.id])
                              .map((c) => ({ id: c.id, name: c.name })),
                          }))
                          .filter((r) => r.child.length > 0);
                        onChange(result);
                      }
                    }}
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>

              {/* Child Rows */}
              {openNodes[node.id] && (
                <div className="ml-3 mt-2 space-y-1 border-l-2 pl-4 border-muted">
                  {node.children.length > 0 ? (
                    node.children.map((child) => (
                      <div
                        key={child.id}
                        className={`flex items-center justify-between p-2 rounded-md border transition-colors cursor-pointer
                          ${
                            selected[child.id]
                              ? "bg-blue-100 hover:bg-blue-200"
                              : "hover:bg-accent"
                          }`}
                      >
                        <label
                          htmlFor={`chk-${child.id}`}
                          className="flex space-x-2 cursor-pointer w-full"
                        >
                          <Checkbox
                            id={`chk-${child.id}`}
                            checked={selected[child.id] || false}
                            onCheckedChange={() => toggleChild(child.id)}
                            className="mt-1"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {child.name}
                            </span>
                            {child.description && (
                              <span className="text-xs text-muted-foreground">
                                {child.description}
                              </span>
                            )}
                          </div>
                        </label>

                        {child.metadata && child.metadata.length > 0 && (
                          <HoverCard openDelay={100} closeDelay={100}>
                            <HoverCardTrigger asChild>
                              <button className="p-1 rounded-full hover:bg-muted">
                                <Info
                                  size={16}
                                  className="text-muted-foreground"
                                />
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-fit p-3 rounded-xl shadow-lg border bg-card">
                              {child.metadata.map((m) => (
                                <div
                                  key={m.key}
                                  className="text-xs text-muted-foreground whitespace-pre-line"
                                >
                                  {m.key}: {m.value}
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
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};

export default TreeDropdown;
