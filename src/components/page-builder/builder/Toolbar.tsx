"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Save,
  Send,
  Undo,
  Redo,
  Eye,
  PanelLeft,
  PanelRight,
  Keyboard,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/shadcn-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PageBuilderPage, PageSection } from "@prisma/client";

interface ToolbarProps {
  page: PageBuilderPage & { sections: PageSection[] };
  sections: PageSection[];
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
  previewMode: "desktop" | "tablet" | "mobile";
  onPreviewModeChange: (mode: "desktop" | "tablet" | "mobile") => void;
  onToggleSidebar: () => void;
  onToggleInspector: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onPreview?: () => void;
}

export function Toolbar({
  page,
  sections,
  onSave,
  onPublish,
  previewMode,
  onPreviewModeChange,
  onToggleSidebar,
  onToggleInspector,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onPreview,
}: ToolbarProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish();
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
      {/* Left - Page Info */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-semibold">{page.name}</h1>
          <p className="text-xs text-muted-foreground">{page.slug}</p>
        </div>
      </div>

      {/* Center - Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo || !onUndo}
          className="gap-2"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo || !onRedo}
          className="gap-2"
        >
          <Redo className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-2" />

        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Draft"}
        </Button>
        <Button
          size="sm"
          onClick={handlePublish}
          disabled={isPublishing}
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          {isPublishing ? "Publishing..." : "Publish"}
        </Button>
      </div>

      {/* Right - View Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="gap-2"
        >
          <PanelLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleInspector}
          className="gap-2"
        >
          <PanelRight className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2" onClick={onPreview}>
              <Eye className="w-4 h-4" />
              Preview in New Tab
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Keyboard className="w-4 h-4" />
              Keyboard Shortcuts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
