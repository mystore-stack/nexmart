import React from "react";
import type { SectionConfig, PageSection } from "../types";

interface DividerSectionProps {
  section: PageSection;
}

export function DividerSection({ section }: DividerSectionProps) {
  const config = section.config as SectionConfig & {
    color?: string;
    thickness?: string;
    style?: "solid" | "dashed" | "dotted";
    maxWidth?: string;
  };
  const color = config.color || "#e5e7eb";
  const thickness = config.thickness || "1px";
  const style = config.style || "solid";

  return (
    <div className="w-full py-4">
      <div
        style={{
          borderTop: `${thickness} ${style} ${color}`,
          maxWidth: config.maxWidth || "100%",
          margin: "0 auto",
        }}
      />
    </div>
  );
}
