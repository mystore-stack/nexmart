"use client";

import React from "react";
import { motion } from "framer-motion";
import { Monitor, Tablet, Smartphone, RefreshCw } from "lucide-react";
import type { PageSection } from "@prisma/client";
import { PageSectionRenderer } from "../PageSectionRenderer";

interface PreviewFrameProps {
  sections: PageSection[];
  previewMode: "desktop" | "tablet" | "mobile";
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
}

const PREVIEW_SIZES = {
  desktop: { width: "100%", maxWidth: "100%" },
  tablet: { width: "768px", maxWidth: "100%" },
  mobile: { width: "375px", maxWidth: "100%" },
};

export function PreviewFrame({ sections, previewMode, selectedSectionId, onSelectSection }: PreviewFrameProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Preview</span>
          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <PreviewModeButton
            mode="desktop"
            currentMode={previewMode}
            icon={Monitor}
            label="Desktop"
          />
          <PreviewModeButton
            mode="tablet"
            currentMode={previewMode}
            icon={Tablet}
            label="Tablet"
          />
          <PreviewModeButton
            mode="mobile"
            currentMode={previewMode}
            icon={Smartphone}
            label="Mobile"
          />
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-muted/30 p-8 flex items-start justify-center">
        <motion.div
          key={previewMode}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-background shadow-2xl rounded-lg overflow-hidden"
          style={PREVIEW_SIZES[previewMode]}
        >
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="min-h-screen">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  onClick={() => onSelectSection(section.id)}
                  className={`relative transition-all ${
                    selectedSectionId === section.id
                      ? "ring-2 ring-primary ring-offset-2"
                      : "hover:ring-2 hover:ring-primary/50 hover:ring-offset-2"
                  }`}
                >
                  <PageSectionRenderer section={section} />
                  {selectedSectionId === section.id && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

interface PreviewModeButtonProps {
  mode: "desktop" | "tablet" | "mobile";
  currentMode: "desktop" | "tablet" | "mobile";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function PreviewModeButton({ mode, currentMode, icon: Icon, label }: PreviewModeButtonProps) {
  const isActive = mode === currentMode;

  return (
    <button
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
