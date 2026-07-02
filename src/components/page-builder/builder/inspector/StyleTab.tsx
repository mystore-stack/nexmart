"use client";

import React from "react";
import { Label } from "@/components/ui/shadcn-label";
import { Input } from "@/components/ui/shadcn-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PageSection } from "@prisma/client";

interface StyleTabProps {
  section: PageSection;
  onUpdate: (section: PageSection) => void;
}

export function StyleTab({ section, onUpdate }: StyleTabProps) {
  return (
    <div className="space-y-6">
      {/* Background Color */}
      <div>
        <Label>Background Color</Label>
        <div className="flex gap-2 mt-2">
          <Input
            type="color"
            value={section.backgroundColor || "#ffffff"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ ...section, backgroundColor: e.target.value })}
            className="w-12 h-10 p-1"
          />
          <Input
            type="text"
            value={section.backgroundColor || "#ffffff"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ ...section, backgroundColor: e.target.value })}
            placeholder="#ffffff"
            className="flex-1"
          />
        </div>
      </div>

      {/* Background Image */}
      <div>
        <Label>Background Image URL</Label>
        <Input
          type="text"
          value={section.backgroundImage || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ ...section, backgroundImage: e.target.value || null })}
          placeholder="https://example.com/image.jpg"
          className="mt-2"
        />
      </div>

      {/* Overlay Color */}
      <div>
        <Label>Overlay Color</Label>
        <div className="flex gap-2 mt-2">
          <Input
            type="color"
            value={section.overlayColor || "#000000"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ ...section, overlayColor: e.target.value })}
            className="w-12 h-10 p-1"
          />
          <Input
            type="text"
            value={section.overlayColor || "#000000"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ ...section, overlayColor: e.target.value })}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </div>

      {/* Overlay Opacity */}
      <div>
        <Label>Overlay Opacity</Label>
        <Input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={section.overlayOpacity || 0}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ ...section, overlayOpacity: parseFloat(e.target.value) })}
          className="mt-2"
        />
        <span className="text-xs text-muted-foreground">{(section.overlayOpacity || 0) * 100}%</span>
      </div>

      {/* Border Radius */}
      <div>
        <Label>Border Radius</Label>
        <Select
          value={section.layoutStyle || "default"}
          onValueChange={(value: string) => onUpdate({ ...section, layoutStyle: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select radius" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="small">Small (4px)</SelectItem>
            <SelectItem value="default">Default (8px)</SelectItem>
            <SelectItem value="medium">Medium (12px)</SelectItem>
            <SelectItem value="large">Large (16px)</SelectItem>
            <SelectItem value="xl">Extra Large (24px)</SelectItem>
            <SelectItem value="full">Full</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Shadow */}
      <div>
        <Label>Shadow</Label>
        <Select
          value={section.themeVariant || "none"}
          onValueChange={(value: string) => onUpdate({ ...section, themeVariant: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select shadow" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
            <SelectItem value="xl">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
