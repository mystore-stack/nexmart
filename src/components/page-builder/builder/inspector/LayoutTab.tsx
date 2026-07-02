"use client";

import React from "react";
import { Label } from "@/components/ui/shadcn-label";
import { Input } from "@/components/ui/shadcn-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PageSection } from "@prisma/client";

interface LayoutTabProps {
  section: PageSection;
  onUpdate: (section: PageSection) => void;
}

export function LayoutTab({ section, onUpdate }: LayoutTabProps) {
  const config = section.config as any;

  return (
    <div className="space-y-6">
      {/* Container Width */}
      <div>
        <Label>Container Width</Label>
        <Select
          value={config.layout?.width || "container"}
          onValueChange={(value: string) => onUpdate({
            ...section,
            config: { ...config, layout: { ...config.layout, width: value } }
          })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select width" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="container">Container (1200px)</SelectItem>
            <SelectItem value="container-lg">Large Container (1400px)</SelectItem>
            <SelectItem value="full">Full Width</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Padding */}
      <div>
        <Label>Padding</Label>
        <Select
          value={section.spacing || "medium"}
          onValueChange={(value: string) => onUpdate({ ...section, spacing: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select padding" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="small">Small (1rem)</SelectItem>
            <SelectItem value="medium">Medium (2rem)</SelectItem>
            <SelectItem value="large">Large (4rem)</SelectItem>
            <SelectItem value="xl">Extra Large (6rem)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Margin */}
      <div>
        <Label>Margin</Label>
        <Input
          type="text"
          value={config.layout?.margin || "0"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({
            ...section,
            config: { ...config, layout: { ...config.layout, margin: e.target.value } }
          })}
          placeholder="0"
          className="mt-2"
        />
      </div>

      {/* Visibility */}
      <div>
        <Label>Visibility</Label>
        <Select
          value={section.visibility || "ALL"}
          onValueChange={(value: "ALL" | "DESKTOP" | "TABLET" | "MOBILE") => onUpdate({ ...section, visibility: value as any })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Devices</SelectItem>
            <SelectItem value="DESKTOP">Desktop Only</SelectItem>
            <SelectItem value="TABLET">Tablet Only</SelectItem>
            <SelectItem value="MOBILE">Mobile Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Text Alignment */}
      <div>
        <Label>Text Alignment</Label>
        <Select
          value={config.layout?.alignment || "left"}
          onValueChange={(value: string) => onUpdate({
            ...section,
            config: { ...config, layout: { ...config.layout, alignment: value } }
          })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select alignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
