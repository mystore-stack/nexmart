import React from "react";
import type { SectionConfig, PageSection, IconItem } from "../types";

interface IconGridSectionProps {
  section: PageSection;
}

export function IconGridSection({ section }: IconGridSectionProps) {
  const config = section.config as SectionConfig & {
    items?: IconItem[];
    columns?: 2 | 3 | 4;
    iconBgColor?: string;
  };
  const items = config.items || [];

  if (items.length === 0) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          No icon items configured
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {config.title && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{config.title}</h2>
            {config.subtitle && (
              <p className="text-gray-600 mt-2">{config.subtitle}</p>
            )}
          </div>
        )}

        <div
          className={`grid gap-6 ${
            config.columns === 2
              ? "grid-cols-2"
              : config.columns === 3
              ? "grid-cols-3"
              : config.columns === 4
              ? "grid-cols-4"
              : "grid-cols-3"
          }`}
        >
          {items.map((item: IconItem, index: number) => (
            <div key={index} className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full"
                style={{ backgroundColor: config.iconBgColor || "#f3f4f6" }}
              >
                {item.icon && <span className="text-3xl">{item.icon}</span>}
              </div>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
