import React from "react";
import { X } from "lucide-react";
import type { SectionConfig, PageSection } from "../types";

interface AnnouncementBarSectionProps {
  section: PageSection;
}

export function AnnouncementBarSection({ section }: AnnouncementBarSectionProps) {
  const config = section.config as SectionConfig & {
    text?: string;
    ctaText?: string;
    ctaLink?: string;
    icon?: string;
    dismissible?: boolean;
  };

  return (
    <div
      className="w-full"
      style={{
        backgroundColor: section.backgroundColor || config.backgroundColor || "#000000",
        color: config.textColor || "#ffffff",
        padding: config.padding || "12px 24px",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {config.icon && <span className="text-xl">{config.icon}</span>}
          <p className="text-sm font-medium">{config.text || "Announcement text"}</p>
        </div>
        <div className="flex items-center gap-4">
          {config.ctaText && config.ctaLink && (
            <a
              href={config.ctaLink}
              className="text-sm font-semibold underline hover:no-underline"
            >
              {config.ctaText}
            </a>
          )}
          {config.dismissible && (
            <button className="p-1 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
