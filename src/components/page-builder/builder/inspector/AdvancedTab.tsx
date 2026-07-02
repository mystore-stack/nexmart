"use client";

import React from "react";
import { Label } from "@/components/ui/shadcn-label";
import { Input } from "@/components/ui/shadcn-input";
import { Switch } from "@/components/ui/shadcn-switch";
import type { PageSection } from "@prisma/client";

interface AdvancedTabProps {
  section: PageSection;
  onUpdate: (section: PageSection) => void;
}

export function AdvancedTab({ section, onUpdate }: AdvancedTabProps) {
  const config = section.config as any;

  return (
    <div className="space-y-6">
      {/* Custom CSS Class */}
      <div>
        <Label>Custom CSS Class</Label>
        <Input
          type="text"
          value={config.customCssClass || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({
            ...section,
            config: { ...config, customCssClass: e.target.value }
          })}
          placeholder="my-custom-class"
          className="mt-2"
        />
      </div>

      {/* Anchor ID */}
      <div>
        <Label>Anchor ID</Label>
        <Input
          type="text"
          value={config.anchorId || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({
            ...section,
            config: { ...config, anchorId: e.target.value }
          })}
          placeholder="section-id"
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Used for direct linking to this section
        </p>
      </div>

      {/* Custom CSS */}
      <div>
        <Label>Custom CSS</Label>
        <textarea
          value={config.customCss || ""}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate({
            ...section,
            config: { ...config, customCss: e.target.value }
          })}
          placeholder=".my-class { color: red; }"
          className="mt-2 w-full h-32 px-3 py-2 text-sm rounded-md border border-border font-mono"
        />
      </div>

      {/* Z-Index */}
      <div>
        <Label>Z-Index</Label>
        <Input
          type="number"
          value={config.zIndex || "auto"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({
            ...section,
            config: { ...config, zIndex: e.target.value }
          })}
          placeholder="auto"
          className="mt-2"
        />
      </div>

      {/* Hide on Empty */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Hide if Empty</Label>
          <p className="text-xs text-muted-foreground">
            Hide section when content is empty
          </p>
        </div>
        <Switch
          checked={config.hideIfEmpty || false}
          onCheckedChange={(checked: boolean) => onUpdate({
            ...section,
            config: { ...config, hideIfEmpty: checked }
          })}
        />
      </div>

      {/* Lazy Load */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Lazy Load</Label>
          <p className="text-xs text-muted-foreground">
            Load section only when visible
          </p>
        </div>
        <Switch
          checked={config.lazyLoad || false}
          onCheckedChange={(checked: boolean) => onUpdate({
            ...section,
            config: { ...config, lazyLoad: checked }
          })}
        />
      </div>

      {/* Disable Animation */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Disable Animation</Label>
          <p className="text-xs text-muted-foreground">
            Turn off all animations for this section
          </p>
        </div>
        <Switch
          checked={config.disableAnimation || false}
          onCheckedChange={(checked: boolean) => onUpdate({
            ...section,
            config: { ...config, disableAnimation: checked }
          })}
        />
      </div>
    </div>
  );
}
