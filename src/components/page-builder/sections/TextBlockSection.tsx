import React from "react";
import type { SectionConfig, PageSection } from "../types";

interface TextBlockSectionProps {
  section: PageSection;
}

export function TextBlockSection({ section }: TextBlockSectionProps) {
  const config = section.config as SectionConfig & { content?: string };

  if (!config.title && !config.content) {
    return (
      <section className="py-16 md:py-24">
        <div className="container-main">
          <div className="text-center text-gray-500">
            Text block content not configured
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`py-16 md:py-24 ${
        section.spacing === "large" ? "py-32" : section.spacing === "small" ? "py-12" : ""
      }`}
      style={{ backgroundColor: section.backgroundColor || config.backgroundColor }}
    >
      <div className="container-main">
        <div
          className={`max-w-4xl mx-auto ${
            config.textAlign === "center"
              ? "text-center"
              : config.textAlign === "right"
              ? "text-right"
              : ""
          }`}
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            {config.title || "Section Title"}
          </h2>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: config.content || "Section content goes here" }}
          />
        </div>
      </div>
    </section>
  );
}
