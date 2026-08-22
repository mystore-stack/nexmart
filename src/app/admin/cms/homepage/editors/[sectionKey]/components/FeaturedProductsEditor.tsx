"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { ProductSelector } from "@/components/admin/ProductSelector";
import { ChevronUp, ChevronDown, Trash2, Plus, Search, X, ChevronDown as DropdownIcon } from "lucide-react";

interface CategoryTabConfig {
  categoryId: string;
  categoryName: string;
  displayLabel: string;
  enabled: boolean;
  order: number;
}

export function FeaturedProductsEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<any[]>([]);
  const [config, setConfig] = useState(parsedConfig || {
    title: "Featured Products",
    subtitle: "Discover our products",
    ctaText: "Discover More",
    maxProducts: section.maxProducts || 18,
    enableTabs: true,
    categoryTabs: []
  });
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch categories from API
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          // Flatten categories to include both parent and child categories
          const allCategories: any[] = [];
          data.data.forEach((parent: any) => {
            allCategories.push(parent);
            if (parent.children && parent.children.length > 0) {
              parent.children.forEach((child: any) => {
                allCategories.push(child);
              });
            }
          });
          setCategories(allCategories);
        }
      })
      .catch(console.error);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      await updateSectionConfig(section.id, config);
      router.refresh();
    });
  };

  const addCategoryTab = (categoryId: string, categoryName: string) => {
    const newTab: CategoryTabConfig = {
      categoryId,
      categoryName,
      displayLabel: categoryName,
      enabled: true,
      order: config.categoryTabs?.length || 0
    };
    setConfig({
      ...config,
      categoryTabs: [...(config.categoryTabs || []), newTab] as any
    });
  };

  const updateCategoryTab = (index: number, updates: Partial<CategoryTabConfig>) => {
    const updatedTabs = [...(config.categoryTabs || [])];
    updatedTabs[index] = { ...updatedTabs[index], ...updates };
    setConfig({ ...config, categoryTabs: updatedTabs as any });
  };

  const removeCategoryTab = (index: number) => {
    const updatedTabs = config.categoryTabs?.filter((_: any, i: number) => i !== index) || [];
    setConfig({ ...config, categoryTabs: updatedTabs as any });
  };

  const moveCategoryTab = (index: number, direction: 'up' | 'down') => {
    const tabs = [...(config.categoryTabs || [])];
    if (direction === 'up' && index > 0) {
      [tabs[index], tabs[index - 1]] = [tabs[index - 1], tabs[index]];
    } else if (direction === 'down' && index < tabs.length - 1) {
      [tabs[index], tabs[index + 1]] = [tabs[index + 1], tabs[index]];
    }
    // Update order values
    const reorderedTabs = tabs.map((tab: any, i: number) => ({ ...tab, order: i }));
    setConfig({ ...config, categoryTabs: reorderedTabs as any });
  };

  const availableCategories = categories.filter(
    cat => !config.categoryTabs?.some((tab: CategoryTabConfig) => tab.categoryId === cat.id)
  );

  const filteredCategories = availableCategories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Découvrez nos produits Configuration</h3>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Configure the category tabs and product display for the "Découvrez nos produits" section.
        </p>

        <div className="bg-card p-6 rounded-2xl border space-y-6 mb-6">
          <h4 className="font-semibold text-lg border-b pb-2">Header Texts & Config</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input 
                type="text" 
                value={config.title || ""}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input 
                type="text" 
                value={config.subtitle || ""}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Button Text (CTA)</label>
              <input 
                type="text" 
                value={config.ctaText || ""}
                onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Maximum Products</label>
              <input 
                type="number" 
                value={config.maxProducts || 18}
                onChange={(e) => setConfig({ ...config, maxProducts: Number(e.target.value) })}
                className="w-full border rounded-lg p-2"
                min="1"
                max="40"
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="enableTabs"
                checked={config.enableTabs !== false}
                onChange={(e) => setConfig({ ...config, enableTabs: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="enableTabs" className="text-sm font-medium">Enable Category Tabs</label>
            </div>
          </div>
        </div>

        {config.enableTabs !== false && (
          <div className="bg-card p-6 rounded-2xl border space-y-6 mb-6">
            <h4 className="font-semibold text-lg border-b pb-2">Category Tabs Configuration</h4>
            <p className="text-sm text-muted-foreground">
              Configure which categories appear as tabs. "Tous" (All) is always included and cannot be removed.
            </p>

            {/* Add new category tab */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex-1 border rounded-lg p-3 text-left flex items-center justify-between hover:border-brand-500 transition-colors"
                >
                  <span className="text-muted-foreground">Add a category...</span>
                  <DropdownIcon className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {showCategoryDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-card border rounded-xl shadow-lg max-h-80 overflow-hidden">
                  {/* Search input */}
                  <div className="p-3 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {/* Category list */}
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            addCategoryTab(cat.id, cat.name);
                            setCategorySearch("");
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            {cat.image && (
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium text-sm">{cat.name}</div>
                              <div className="text-xs text-muted-foreground">{cat.slug}</div>
                            </div>
                          </div>
                          <Plus className="w-4 h-4 text-muted-foreground group-hover:text-brand-600" />
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {categorySearch ? "No categories found" : "No available categories"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Category tabs list */}
            <div className="space-y-3">
              {/* Tous (All) - always first */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-semibold text-sm">
                  *
                </div>
                <div className="flex-1">
                  <div className="font-medium">Tous</div>
                  <div className="text-xs text-muted-foreground">All products (default)</div>
                </div>
                <div className="text-xs text-muted-foreground">Always enabled</div>
              </div>

              {/* Configured category tabs */}
              {(config.categoryTabs || []).map((tab: CategoryTabConfig, index: number) => (
                <div key={tab.categoryId} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveCategoryTab(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-muted rounded text-muted-foreground disabled:opacity-50"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveCategoryTab(index, 'down')}
                      disabled={index === (config.categoryTabs?.length || 0) - 1}
                      className="p-1 hover:bg-muted rounded text-muted-foreground disabled:opacity-50"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={tab.enabled}
                        onChange={(e) => updateCategoryTab(index, { enabled: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">{tab.categoryName}</span>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Display Label</label>
                      <input
                        type="text"
                        value={tab.displayLabel}
                        onChange={(e) => updateCategoryTab(index, { displayLabel: e.target.value })}
                        className="w-full border rounded p-1 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => removeCategoryTab(index)}
                    className="p-2 hover:bg-red-50 rounded text-red-600"
                    title="Remove category tab"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {(config.categoryTabs || []).length === 0 && availableCategories.length === 0 && categories.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No categories available in the database. Create categories first to enable category tabs.
                </div>
              )}

              {(config.categoryTabs || []).length === 0 && availableCategories.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No category tabs configured. Add categories above to enable filtering.
                </div>
              )}

              {/* Category tabs preview */}
              {(config.categoryTabs || []).length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h5 className="text-sm font-medium text-muted-foreground mb-3">Category Tabs Preview</h5>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategoryTab("all")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategoryTab === "all"
                          ? "bg-brand-600 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      Tous
                    </button>
                    {(config.categoryTabs || []).map((tab: CategoryTabConfig) => (
                      <button
                        key={tab.categoryId}
                        onClick={() => setSelectedCategoryTab(tab.categoryId)}
                        disabled={!tab.enabled}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedCategoryTab === tab.categoryId
                            ? "bg-brand-600 text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        } ${!tab.enabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {tab.displayLabel || tab.categoryName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Selection - shown in both modes */}
        <div className="bg-card p-6 rounded-2xl border space-y-6">
          <h4 className="font-semibold text-lg border-b pb-2">Selected Products (Manual Mode)</h4>
          <p className="text-sm text-muted-foreground">
            {config.enableTabs !== false
              ? "Select products for each category tab. Use the category tabs above to filter products by category."
              : "When tabs are disabled, you can manually select products to display."
            }
          </p>
          <ProductSelector
            sectionKey={section.sectionKey}
            maxProducts={section.maxProducts || 18}
            initialProducts={section.products || []}
            externalCategoryFilter={config.enableTabs !== false ? selectedCategoryTab : undefined}
          />
        </div>
      </div>
    </div>
  );
}
