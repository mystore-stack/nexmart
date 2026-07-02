import React from "react";
import type { SectionConfig, PageSection } from "../types";

interface SpacerSectionProps {
  section: PageSection;
}

export function SpacerSection({ section }: SpacerSectionProps) {
  const config = section.config as SectionConfig & { height?: string };
  const height = config.height || "40px";

  return <div style={{ height }} className="w-full" />;
}
