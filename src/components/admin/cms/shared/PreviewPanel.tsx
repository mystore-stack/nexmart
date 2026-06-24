"use client";

import { cn } from "@/lib/utils";
import { Monitor, Smartphone, Tablet } from "lucide-react";

type PreviewDevice = "desktop" | "mobile" | "tablet";

interface PreviewPanelProps {
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  children: React.ReactNode;
  className?: string;
}

const DEVICE_WIDTHS: Record<PreviewDevice, string> = {
  desktop: "w-full max-w-5xl",
  tablet: "w-[768px] max-w-full",
  mobile: "w-[375px] max-w-full",
};

export function PreviewPanel({ device, onDeviceChange, children, className }: PreviewPanelProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Live Preview</p>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
          {([
            { id: "desktop" as const, icon: Monitor, label: "Desktop" },
            { id: "tablet" as const, icon: Tablet, label: "Tablet" },
            { id: "mobile" as const, icon: Smartphone, label: "Mobile" },
          ]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onDeviceChange(id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                device === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={label}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center overflow-auto rounded-xl border border-border bg-muted/30 p-4">
        <div
          className={cn(
            "overflow-hidden rounded-lg border border-border bg-background shadow-xl transition-all duration-300",
            DEVICE_WIDTHS[device]
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
