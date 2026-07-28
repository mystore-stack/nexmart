"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  title: string;
  type: "checkbox" | "range" | "color";
  options?: FilterOption[];
  min?: number;
  max?: number;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (groupId: string, value: string, checked: boolean) => void;
  onPriceChange?: (min: number, max: number) => void;
}

export function FilterSidebar({
  isOpen,
  onClose,
  filters,
  selectedFilters,
  onFilterChange,
  onPriceChange,
}: FilterSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(filters.map((f) => [f.id, true]))
  );
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-white shadow-xl lg:relative lg:inset-auto lg:w-auto lg:translate-x-0 lg:shadow-none"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-4 lg:hidden">
          <h2 className="text-lg font-bold text-slate-900">Filtres</h2>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Filter groups */}
        <div className="space-y-0 divide-y divide-slate-200">
          {filters.map((group) => (
            <div key={group.id} className="p-4">
              {/* Group header */}
              <motion.button
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center justify-between mb-3"
              >
                <h3 className="font-bold text-slate-900">{group.title}</h3>
                <motion.div
                  animate={{ rotate: expandedGroups[group.id] ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </motion.div>
              </motion.button>

              {/* Group content */}
              <AnimatePresence>
                {expandedGroups[group.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    {group.type === "checkbox" &&
                      group.options?.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedFilters[group.id]?.includes(option.id) ||
                              false
                            }
                            onChange={(e) =>
                              onFilterChange(
                                group.id,
                                option.id,
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-500"
                          />
                          <span className="text-sm text-slate-700 group-hover:text-slate-900">
                            {option.label}
                          </span>
                          {option.count !== undefined && (
                            <span className="ml-auto text-xs text-slate-500">
                              ({option.count})
                            </span>
                          )}
                        </label>
                      ))}

                    {group.type === "range" && group.min !== undefined && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => {
                              const newMin = Math.min(
                                parseInt(e.target.value),
                                priceRange[1]
                              );
                              setPriceRange([newMin, priceRange[1]]);
                              onPriceChange?.(newMin, priceRange[1]);
                            }}
                            min={group.min}
                            max={group.max}
                            className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                          />
                          <span className="text-slate-500">-</span>
                          <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => {
                              const newMax = Math.max(
                                parseInt(e.target.value),
                                priceRange[0]
                              );
                              setPriceRange([priceRange[0], newMax]);
                              onPriceChange?.(priceRange[0], newMax);
                            }}
                            min={group.min}
                            max={group.max}
                            className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                          />
                        </div>
                        <input
                          type="range"
                          min={group.min}
                          max={group.max}
                          value={priceRange[0]}
                          onChange={(e) => {
                            const newMin = Math.min(
                              parseInt(e.target.value),
                              priceRange[1]
                            );
                            setPriceRange([newMin, priceRange[1]]);
                          }}
                          className="w-full"
                        />
                        <input
                          type="range"
                          min={group.min}
                          max={group.max}
                          value={priceRange[1]}
                          onChange={(e) => {
                            const newMax = Math.max(
                              parseInt(e.target.value),
                              priceRange[0]
                            );
                            setPriceRange([priceRange[0], newMax]);
                          }}
                          className="w-full"
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Footer buttons */}
        <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-2 lg:hidden">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-2.5 rounded-lg font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Appliquer les filtres
          </motion.button>
          <button
            onClick={() => {
              setExpandedGroups(
                Object.fromEntries(filters.map((f) => [f.id, true]))
              );
              setPriceRange([0, 10000]);
            }}
            className="w-full py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </motion.div>
    </>
  );
}
