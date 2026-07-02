import React from "react";
import { Monitor, Laptop, Tablet, Smartphone } from "lucide-react";

export type PreviewMode = "desktop" | "laptop" | "tablet" | "mobile";

interface PreviewModesProps {
  currentMode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
}

const PREVIEW_MODES: { mode: PreviewMode; icon: React.ComponentType<{ className?: string }>; label: string; width: number }[] = [
  { mode: "desktop", icon: Monitor, label: "Desktop", width: 1920 },
  { mode: "laptop", icon: Laptop, label: "Laptop", width: 1366 },
  { mode: "tablet", icon: Tablet, label: "Tablet", width: 768 },
  { mode: "mobile", icon: Smartphone, label: "Mobile", width: 375 },
];

export function PreviewModes({ currentMode, onModeChange }: PreviewModesProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1" role="group" aria-label="Preview mode selector">
      {PREVIEW_MODES.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
            currentMode === mode
              ? "bg-white text-primary-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
          }`}
          title={label}
          aria-label={`Switch to ${label} preview`}
          aria-pressed={currentMode === mode}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}

export function getPreviewWidth(mode: PreviewMode): number {
  const modeConfig = PREVIEW_MODES.find((m) => m.mode === mode);
  return modeConfig?.width || 1920;
}

export function PreviewContainer({ mode, children }: { mode: PreviewMode; children: React.ReactNode }) {
  const width = getPreviewWidth(mode);

  return (
    <div
      className="mx-auto transition-all duration-300 ease-in-out"
      style={{
        width: mode === "desktop" ? "100%" : `${width}px`,
        maxWidth: "100%",
      }}
    >
      {children}
    </div>
  );
}
