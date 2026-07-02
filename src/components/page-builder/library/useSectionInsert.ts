import { useState, useCallback, useRef } from "react";
import type { PageSection, SectionConfig } from "../types";
import { getSectionById } from "./section-library";

interface UseSectionInsertOptions {
  onSectionInsert?: (section: PageSection, position: number) => void;
  onSectionFocus?: (sectionId: string) => void;
  onSettingsOpen?: (sectionId: string) => void;
}

export function useSectionInsert(options: UseSectionInsertOptions = {}) {
  const { onSectionInsert, onSectionFocus, onSettingsOpen } = options;
  const [insertPosition, setInsertPosition] = useState<number | null>(null);
  const insertedSectionRef = useRef<string | null>(null);

  const openLibraryAt = useCallback((position: number) => {
    setInsertPosition(position);
  }, []);

  const closeLibrary = useCallback(() => {
    setInsertPosition(null);
  }, []);

  const insertSection = useCallback(
    (sectionId: string, config: SectionConfig) => {
      const sectionDefinition = getSectionById(sectionId);
      if (!sectionDefinition) return;

      const newSection: PageSection = {
        id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sectionType: sectionId as PageSection["sectionType"],
        config: config || sectionDefinition.defaultConfig,
        enabled: true,
        displayOrder: insertPosition !== null ? insertPosition : 0,
        backgroundColor: config?.backgroundColor || sectionDefinition.defaultConfig.backgroundColor,
        backgroundImage: config?.backgroundImage || sectionDefinition.defaultConfig.backgroundImage,
        overlayColor: config?.overlayColor || sectionDefinition.defaultConfig.overlayColor,
        overlayOpacity: config?.overlayOpacity || sectionDefinition.defaultConfig.overlayOpacity,
        spacing: config?.spacing || sectionDefinition.defaultConfig.spacing,
      };

      insertedSectionRef.current = newSection.id;

      // Call the insert callback
      if (onSectionInsert) {
        onSectionInsert(newSection, insertPosition !== null ? insertPosition : 0);
      }

      // Focus the new section after a short delay
      setTimeout(() => {
        if (onSectionFocus && insertedSectionRef.current) {
          onSectionFocus(insertedSectionRef.current);
        }
      }, 100);

      // Open settings panel after focusing
      setTimeout(() => {
        if (onSettingsOpen && insertedSectionRef.current) {
          onSettingsOpen(insertedSectionRef.current);
        }
      }, 300);

      // Scroll the section into view
      setTimeout(() => {
        const element = document.getElementById(`section-${insertedSectionRef.current}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 400);

      return newSection;
    },
    [insertPosition, onSectionInsert, onSectionFocus, onSettingsOpen]
  );

  return {
    insertPosition,
    openLibraryAt,
    closeLibrary,
    insertSection,
  };
}
