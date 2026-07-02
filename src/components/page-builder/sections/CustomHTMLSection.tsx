import React from "react";
import type { SectionConfig, PageSection } from "../types";

interface CustomHTMLSectionProps {
  section: PageSection;
}

/**
 * SECURITY NOTE: This component uses dangerouslySetInnerHTML which can expose XSS vulnerabilities.
 * In production, consider sanitizing the HTML content using a library like DOMPurify:
 * import DOMPurify from 'dompurify';
 * dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(config.html) }}
 */
export function CustomHTMLSection({ section }: CustomHTMLSectionProps) {
  const config = section.config as SectionConfig & { html?: string };

  if (!config.html) {
    return (
      <div className="py-4 px-4">
        <div className="text-center text-gray-500">
          No HTML content configured
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 px-4">
      <div dangerouslySetInnerHTML={{ __html: config.html || "" }} />
    </div>
  );
}
