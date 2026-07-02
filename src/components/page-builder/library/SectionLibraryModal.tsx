"use client";

import React, { useState, useMemo, useCallback } from "react";
import { X, Search, Star, Clock, TrendingUp, Filter } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { useSectionLibrary } from "./useSectionLibrary";
import {
  SECTION_DEFINITIONS,
  SECTION_CATEGORIES,
  type SectionCategory,
  type SectionDefinition,
  searchSections,
  filterSections,
  getSectionById,
} from "./section-library";
import type { SectionConfig } from "../types";

interface SectionLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (sectionId: string, config: SectionConfig) => void;
  insertPosition?: number;
}

export const SectionLibraryModal = React.memo(function SectionLibraryModal({
  isOpen,
  onClose,
  onInsert,
  insertPosition,
}: SectionLibraryModalProps) {
  const { favorites, recentlyUsed, toggleFavorite, addToRecentlyUsed, isFavorite } =
    useSectionLibrary();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SectionCategory | "all">("all");
  const [showOnlyPopular, setShowOnlyPopular] = useState(false);
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Filter and search sections
  const filteredSections = useMemo(() => {
    let sections = SECTION_DEFINITIONS;

    // Apply search
    if (searchQuery.trim()) {
      sections = searchSections(searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      sections = sections.filter((section) =>
        section.categories.includes(selectedCategory)
      );
    }

    // Apply popular filter
    if (showOnlyPopular) {
      sections = sections.filter((section) => section.popular);
    }

    // Apply new filter
    if (showOnlyNew) {
      sections = sections.filter((section) => section.isNew);
    }

    // Apply favorites filter
    if (showOnlyFavorites) {
      sections = sections.filter((section) => isFavorite(section.id));
    }

    return sections;
  }, [searchQuery, selectedCategory, showOnlyPopular, showOnlyNew, showOnlyFavorites, isFavorite]);

  // Get recently used sections
  const recentlyUsedSections = useMemo(() => {
    return recentlyUsed
      .map((id) => getSectionById(id))
      .filter((section): section is SectionDefinition => section !== undefined);
  }, [recentlyUsed]);

  // Get favorite sections
  const favoriteSections = useMemo(() => {
    return favorites
      .map((id) => getSectionById(id))
      .filter((section): section is SectionDefinition => section !== undefined);
  }, [favorites]);

  // Get popular sections
  const popularSections = useMemo(() => {
    return SECTION_DEFINITIONS.filter((section) => section.popular);
  }, []);

  const handleInsert = useCallback(
    (sectionId: string) => {
      const section = getSectionById(sectionId);
      if (section) {
        addToRecentlyUsed(sectionId);
        onInsert(sectionId, section.defaultConfig);
        onClose();
      }
    },
    [onInsert, onClose, addToRecentlyUsed]
  );

  const handleToggleFavorite = useCallback(
    (sectionId: string) => {
      toggleFavorite(sectionId);
    },
    [toggleFavorite]
  );

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setShowOnlyPopular(false);
    setShowOnlyNew(false);
    setShowOnlyFavorites(false);
  }, []);

  const hasActiveFilters =
    searchQuery.trim() ||
    selectedCategory !== "all" ||
    showOnlyPopular ||
    showOnlyNew ||
    showOnlyFavorites;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="section-library-title">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 id="section-library-title" className="text-2xl font-bold text-gray-900">Add Section</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose from {SECTION_DEFINITIONS.length} available sections
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close section library"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                aria-label="Search sections"
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value as SectionCategory | "all")
                }
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {SECTION_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Filters */}
            <button
              onClick={() => setShowOnlyPopular(!showOnlyPopular)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showOnlyPopular
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setShowOnlyNew(!showOnlyNew)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showOnlyNew
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              New
            </button>
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showOnlyFavorites
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Favorites
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Recently Used */}
          {recentlyUsedSections.length > 0 && !hasActiveFilters && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Recently Used</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recentlyUsedSections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    onInsert={handleInsert}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={isFavorite(section.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Favorites */}
          {favoriteSections.length > 0 && !hasActiveFilters && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Favorites</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {favoriteSections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    onInsert={handleInsert}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={isFavorite(section.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recommended/Popular */}
          {popularSections.length > 0 && !hasActiveFilters && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Recommended</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {popularSections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    onInsert={handleInsert}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={isFavorite(section.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Sections */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {hasActiveFilters ? `Results (${filteredSections.length})` : "All Sections"}
            </h3>
            {filteredSections.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No sections found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    onInsert={handleInsert}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={isFavorite(section.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredSections.length} section{filteredSections.length !== 1 ? "s" : ""} available
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});
