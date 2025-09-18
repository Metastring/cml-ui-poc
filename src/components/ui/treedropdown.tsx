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

export type SelectedShape = { parent: string; child: { name: string }[] }[];

interface TreeDropdownProps {
  nodes: Node[];
  buttonLabel?: string;
  selected: SelectedShape;
  onChange: (selected: SelectedShape) => void;
  isLoading?: boolean;
  isError?: boolean;
}

const TreeDropdown: React.FC<TreeDropdownProps> = ({
  nodes,
  buttonLabel = "Select Items",
  selected,
  onChange,
  isLoading = false,
  isError = false,
}) => {
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (id: string) => {
    setOpenNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isChildSelected = (parent: string, childId: string) => {
    return selected.some(
      (s) =>
        s.parent === parent &&
        s.child.some((c) => c.name === childId) // here using `name` as unique
    );
  };

  const toggleChild = (parent: string, child: ChildNode) => {
    const newSelected = [...selected];
    const parentIndex = newSelected.findIndex((s) => s.parent === parent);

    if (parentIndex >= 0) {
      const childIndex = newSelected[parentIndex].child.findIndex(
        (c) => c.name === child.name
      );
      if (childIndex >= 0) {
        // remove child
        newSelected[parentIndex].child.splice(childIndex, 1);
      } else {
        // add child
        newSelected[parentIndex].child.push({ name: child.name });
      }

      // remove parent if empty
      if (newSelected[parentIndex].child.length === 0) {
        newSelected.splice(parentIndex, 1);
      }
    } else {
      // add new parent with child
      newSelected.push({ parent, child: [{ name: child.name }] });
    }

    onChange(newSelected);
  };

  const clearParentSelection = (parent: string) => {
    const newSelected = selected.filter((s) => s.parent !== parent);
    onChange(newSelected);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[300px] justify-between">
          <div>
            {buttonLabel}
            {selected.length > 0 && (
              <span className="ml-1 text-sm">
                ({selected.flatMap((s) => s.child).length})
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
                  onClick={() => toggleNode(node.id)}
                >
                  <button className="p-1">
                    {openNodes[node.id] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  <span className="font-medium">{node.name}</span>

                  {selected.find((s) => s.parent === node.name)?.child.length ? (
                    <span className="text-xs text-muted-foreground">
                      (
                      {
                        selected.find((s) => s.parent === node.name)?.child
                          .length
                      }
                      )
                    </span>
                  ) : null}
                </div>

                {selected.find((s) => s.parent === node.name) && (
                  <button
                    className="text-red-500 p-1 hover:bg-red-100 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearParentSelection(node.name);
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
                        className={`flex items-center justify-between p-2 rounded-md border transition-colors cursor-pointer ${
                          isChildSelected(node.name, child.name)
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
                            checked={isChildSelected(node.name, child.name)}
                            onCheckedChange={() => toggleChild(node.name, child)}
                            className="mt-1"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {child.name}
                            </span>
                            {child.description && (
                              <span
                                className="text-xs text-muted-foreground line-clamp-2 max-w-sm whitespace-pre-wrap"
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
                              <button className="p-1 rounded-full hover:bg-muted">
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
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};

export default TreeDropdown;
