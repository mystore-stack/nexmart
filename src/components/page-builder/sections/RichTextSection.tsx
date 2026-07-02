import React from "react";
import type { SectionConfig, PageSection } from "../types";

interface RichTextSectionProps {
  section: PageSection;
}

/**
 * SECURITY NOTE: This component uses dangerouslySetInnerHTML which can expose XSS vulnerabilities.
 * In production, consider sanitizing the HTML content using a library like DOMPurify:
 * import DOMPurify from 'dompurify';
 * dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(config.content) }}
 */
export function RichTextSection({ section }: RichTextSectionProps) {
  const config = section.config as SectionConfig & { content?: string };

  if (!config.content) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center text-gray-500">
          No content configured
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div
        className="max-w-4xl mx-auto prose prose-lg"
        dangerouslySetInnerHTML={{ __html: config.content || "" }}
        style={{
          textAlign: config.textAlign || "left",
          color: config.textColor || "#000000",
        }}
      />
    </div>
  );
}
