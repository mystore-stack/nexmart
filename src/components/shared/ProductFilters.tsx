"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  type?: "checkbox" | "radio" | "range";
  min?: number;
  max?: number;
}

interface ProductFiltersProps {
  filters: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (groupId: string, optionId: string) => void;
  onClearFilters: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function ProductFilters({
  filters,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  isOpen = true,
  onToggle,
}: ProductFiltersProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(filters.map((f) => f.id))
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const getSelectedCount = () => {
    return Object.values(selectedFilters).reduce((acc, ids) => acc + ids.length, 0);
  };

  return (
    <div className="w-full">
      {/* Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-card border border-border rounded-lg"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-medium">Filters</span>
            {getSelectedCount() > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                {getSelectedCount()}
              </span>
            )}
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Clear Filters */}
            {getSelectedCount() > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {getSelectedCount()} filter{getSelectedCount() !== 1 ? "s" : ""} applied
                </span>
                <button
                  onClick={onClearFilters}
                  className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear all
                </button>
              </div>
            )}

            {/* Filter Groups */}
            {filters.map((group) => (
              <div key={group.id} className="border-b border-border pb-6 last:border-0">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between gap-2 mb-4"
                >
                  <h3 className="font-semibold text-base">{group.label}</h3>
                  {expandedGroups.has(group.id) ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedGroups.has(group.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      {group.options.map((option) => {
                        const isSelected = selectedFilters[group.id]?.includes(option.id);
                        
                        if (group.type === "checkbox") {
                          return (
                            <label
                              key={option.id}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => onFilterChange(group.id, option.id)}
                                  className="sr-only"
                                />
                                <div
                                  className={`w-5 h-5 rounded border-2 transition-colors ${
                                    isSelected
                                      ? "bg-primary border-primary"
                                      : "border-border group-hover:border-primary/50"
                                  }`}
                                >
                                  {isSelected && (
                                    <svg
                                      className="w-3 h-3 text-primary-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <span className="flex-1 text-sm">{option.label}</span>
                              {option.count !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  ({option.count})
                                </span>
                              )}
                            </label>
                          );
                        }

                        if (group.type === "radio") {
                          return (
                            <label
                              key={option.id}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <div className="relative">
                                <input
                                  type="radio"
                                  name={group.id}
                                  checked={isSelected}
                                  onChange={() => onFilterChange(group.id, option.id)}
                                  className="sr-only"
                                />
                                <div
                                  className={`w-5 h-5 rounded-full border-2 transition-colors ${
                                    isSelected
                                      ? "border-primary"
                                      : "border-border group-hover:border-primary/50"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                  )}
                                </div>
                              </div>
                              <span className="flex-1 text-sm">{option.label}</span>
                              {option.count !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  ({option.count})
                                </span>
                              )}
                            </label>
                          );
                        }

                        return null;
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
