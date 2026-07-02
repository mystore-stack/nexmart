import { useState, useCallback } from "react";
import type { BlockTemplate, BlockTemplateCategory } from "./BlockTemplate";

const STORAGE_KEY = "page-builder-templates";
const CATEGORIES_STORAGE_KEY = "page-builder-template-categories";

const DEFAULT_CATEGORIES: BlockTemplateCategory[] = [
  { id: "hero", name: "Hero Sections", description: "Page headers and hero blocks" },
  { id: "marketing", name: "Marketing", description: "Promotional and marketing sections" },
  { id: "content", name: "Content", description: "Text and content sections" },
  { id: "products", name: "Products", description: "Product display sections" },
  { id: "conversion", name: "Conversion", description: "CTA and conversion blocks" },
  { id: "custom", name: "Custom", description: "User-created templates" },
];

export function useBlockTemplates() {
  const [templates, setTemplates] = useState<BlockTemplate[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [categories, setCategories] = useState<BlockTemplateCategory[]>(() => {
    if (typeof window === "undefined") return DEFAULT_CATEGORIES;
    try {
      const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const saveTemplates = useCallback((newTemplates: BlockTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplates));
  }, []);

  const saveCategories = useCallback((newCategories: BlockTemplateCategory[]) => {
    setCategories(newCategories);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(newCategories));
  }, []);

  const createTemplate = useCallback(
    (name: string, description: string, category: string, sections: any[], tags: string[] = []) => {
      const newTemplate: BlockTemplate = {
        id: `template-${Date.now()}`,
        name,
        description,
        category,
        sections,
        tags,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      saveTemplates([...templates, newTemplate]);
      return newTemplate;
    },
    [templates, saveTemplates]
  );

  const updateTemplate = useCallback(
    (id: string, updates: Partial<BlockTemplate>) => {
      const updatedTemplates = templates.map((template) =>
        template.id === id
          ? { ...template, ...updates, updatedAt: new Date() }
          : template
      );
      saveTemplates(updatedTemplates);
    },
    [templates, saveTemplates]
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      saveTemplates(templates.filter((template) => template.id !== id));
    },
    [templates, saveTemplates]
  );

  const duplicateTemplate = useCallback(
    (id: string) => {
      const template = templates.find((t) => t.id === id);
      if (!template) return null;

      const duplicated: BlockTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        name: `${template.name} (Copy)`,
        sections: template.sections.map((section) => ({
          ...section,
          id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      saveTemplates([...templates, duplicated]);
      return duplicated;
    },
    [templates, saveTemplates]
  );

  const getTemplatesByCategory = useCallback(
    (category: string) => {
      return templates.filter((template) => template.category === category);
    },
    [templates]
  );

  const searchTemplates = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return templates.filter(
        (template) =>
          template.name.toLowerCase().includes(lowerQuery) ||
          template.description.toLowerCase().includes(lowerQuery) ||
          template.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    },
    [templates]
  );

  return {
    templates,
    categories,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    getTemplatesByCategory,
    searchTemplates,
    saveCategories,
  };
}
