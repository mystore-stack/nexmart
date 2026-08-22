"use client";

import React, { createContext, useContext } from "react";
import type { SiteConfigBundle } from "@/lib/cms/data";

const SiteConfigContext = createContext<SiteConfigBundle | null>(null);

export function SiteConfigProvider({
  value,
  children,
}: {
  value: SiteConfigBundle;
  children: React.ReactNode;
}) {
  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteConfigBundle {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    throw new Error("useSiteConfig must be used within SiteConfigProvider");
  }
  return ctx;
}

export function useSiteSettings() {
  return useSiteConfig().settings;
}
