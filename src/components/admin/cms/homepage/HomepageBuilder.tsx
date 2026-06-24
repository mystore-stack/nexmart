"use client";

import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Undo2,
  Redo2,
  Save,
  Upload,
  Eye,
  EyeOff,
  History,
  GripVertical,
} from "lucide-react";
import { CmsShell } from "@/components/admin/cms/shell/CmsShell";
import { DragDropList } from "@/components/admin/cms/shared/DragDropList";
import { PreviewPanel } from "@/components/admin/cms/shared/PreviewPanel";
import { StatusBadge } from "@/components/admin/cms/shared/StatusBadge";
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  HOMEPAGE_SECTION_META,
} from "@/lib/cms/constants";
import {
  saveHomepageDraft,
  publishHomepage,
  rollbackHomepage,
  reorderHomepageSections,
} from "@/lib/cms/actions";
import type { HomepageSectionType, CMSContentStatus } from "@prisma/client";

interface SectionItem {
  id: string;
  type: HomepageSectionType;
  title?: string | null;
  subtitle?: string | null;
  config: Record<string, unknown>;
  isVisible: boolean;
  displayOrder: number;
}

interface VersionItem {
  id: string;
  version: number;
  note?: string | null;
  createdAt: string;
}

interface HomepageBuilderProps {
  initialSections: SectionItem[];
  initialStatus: CMSContentStatus;
  initialVersion: number;
  versions: VersionItem[];
  newsletter: {
    enabled: boolean;
    title?: string | null;
    subtitle?: string | null;
  };
}

type HistoryState = { sections: SectionItem[]; newsletter: HomepageBuilderProps["newsletter"] };

export function HomepageBuilder({
  initialSections,
  initialStatus,
  initialVersion,
  versions,
  newsletter: initialNewsletter,
}: HomepageBuilderProps) {
  const [sections, setSections] = useState<SectionItem[]>(initialSections);
  const [newsletter, setNewsletter] = useState(initialNewsletter);
  const [status, setStatus] = useState(initialStatus);
  const [version, setVersion] = useState(initialVersion);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile" | "tablet">("desktop");
  const [saving, setSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  const [history, setHistory] = useState<HistoryState[]>([
    { sections: initialSections, newsletter: initialNewsletter },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback(
    (nextSections: SectionItem[], nextNewsletter = newsletter) => {
      const snapshot = { sections: nextSections, newsletter: nextNewsletter };
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), snapshot]);
      setHistoryIndex((i) => i + 1);
    },
    [historyIndex, newsletter]
  );

  const undo = () => {
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    setSections(prev.sections);
    setNewsletter(prev.newsletter);
    setHistoryIndex((i) => i - 1);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    setSections(next.sections);
    setNewsletter(next.newsletter);
    setHistoryIndex((i) => i + 1);
  };

  const addSection = (type: HomepageSectionType) => {
    const meta = HOMEPAGE_SECTION_META[type];
    const newSection: SectionItem = {
      id: `temp-${Date.now()}`,
      type,
      title: meta.label,
      subtitle: meta.description,
      config: {},
      isVisible: true,
      displayOrder: sections.length,
    };
    const next = [...sections, newSection];
    setSections(next);
    pushHistory(next);
  };

  const toggleVisibility = (id: string) => {
    const next = sections.map((s) =>
      s.id === id ? { ...s, isVisible: !s.isVisible } : s
    );
    setSections(next);
    pushHistory(next);
  };

  const handleReorder = async (reordered: SectionItem[]) => {
    setSections(reordered);
    pushHistory(reordered);

    const persisted = reordered.filter((s) => !s.id.startsWith("temp-"));
    if (persisted.length > 0) {
      await reorderHomepageSections({
        items: persisted.map((s, i) => ({
          id: s.id,
          displayOrder: i,
          isVisible: s.isVisible,
        })),
      });
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    const result = await saveHomepageDraft({
      sections: sections.map((s, i) => ({
        id: s.id.startsWith("temp-") ? undefined : s.id,
        type: s.type,
        title: s.title ?? undefined,
        subtitle: s.subtitle ?? undefined,
        config: s.config,
        isVisible: s.isVisible,
        displayOrder: i,
      })),
      featuredCategories: [],
      featuredProducts: [],
      featuredBrands: [],
      newsletterEnabled: newsletter.enabled,
      newsletterTitle: newsletter.title ?? undefined,
      newsletterSubtitle: newsletter.subtitle ?? undefined,
      status: "DRAFT",
    });

    setSaving(false);
    if (result.success) {
      setStatus("DRAFT");
      toast.success("Draft saved");
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    const saveResult = await saveHomepageDraft({
      sections: sections.map((s, i) => ({
        id: s.id.startsWith("temp-") ? undefined : s.id,
        type: s.type,
        title: s.title ?? undefined,
        subtitle: s.subtitle ?? undefined,
        config: s.config,
        isVisible: s.isVisible,
        displayOrder: i,
      })),
      featuredCategories: [],
      featuredProducts: [],
      featuredBrands: [],
      newsletterEnabled: newsletter.enabled,
      newsletterTitle: newsletter.title ?? undefined,
      newsletterSubtitle: newsletter.subtitle ?? undefined,
      status: "DRAFT",
    });

    if (!saveResult.success) {
      setSaving(false);
      toast.error(saveResult.error);
      return;
    }

    const result = await publishHomepage({ note: `Published v${version + 1}` });
    setSaving(false);
    if (result.success) {
      setStatus("PUBLISHED");
      toast.success("Homepage published");
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const handleRollback = async (versionId: string) => {
    const result = await rollbackHomepage({ versionId });
    if (result.success) {
      toast.success("Version restored");
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const visibleSections = sections.filter((s) => s.isVisible);

  return (
    <CmsShell
      title="Homepage Builder"
      description="Visual drag-and-drop page builder with live preview, versioning, and analytics."
      actions={
        <>
          <button type="button" onClick={undo} disabled={historyIndex <= 0} className="btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-sm">
            <Undo2 className="h-4 w-4" /> Undo
          </button>
          <button type="button" onClick={redo} disabled={historyIndex >= history.length - 1} className="btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-sm">
            <Redo2 className="h-4 w-4" /> Redo
          </button>
          <button type="button" onClick={() => setShowVersions(!showVersions)} className="btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-sm">
            <History className="h-4 w-4" /> v{version}
          </button>
          <button type="button" onClick={handleSaveDraft} disabled={saving} className="btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-sm">
            <Save className="h-4 w-4" /> Save Draft
          </button>
          <button type="button" onClick={handlePublish} disabled={saving} className="btn-primary inline-flex items-center gap-1.5 px-3 py-2 text-sm">
            <Upload className="h-4 w-4" /> Publish
          </button>
        </>
      }
    >
      <div className="mb-4 flex items-center gap-3">
        <StatusBadge status={status} />
        <span className="text-sm text-muted-foreground">{sections.length} sections</span>
      </div>

      {showVersions && versions.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-semibold">Version History</h3>
          <div className="space-y-2">
            {versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Version {v.version}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(v.createdAt).toLocaleString()}
                    {v.note ? ` · ${v.note}` : ""}
                  </p>
                </div>
                <button type="button" onClick={() => handleRollback(v.id)} className="text-xs text-primary hover:underline">
                  Rollback
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {DEFAULT_HOMEPAGE_SECTIONS.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addSection(type)}
                className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
              >
                <Plus className="h-3 w-3" />
                {HOMEPAGE_SECTION_META[type].label}
              </button>
            ))}
          </div>

          <DragDropList
            items={sections}
            onReorder={handleReorder}
            renderItem={(section) => {
              const meta = HOMEPAGE_SECTION_META[section.type];
              return (
                <div className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <p className="font-medium">{section.title ?? meta.label}</p>
                    <p className="text-xs text-muted-foreground">{meta.label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleVisibility(section.id)}
                    className="shrink-0 rounded-md p-1.5 hover:bg-muted"
                    title={section.isVisible ? "Hide section" : "Show section"}
                  >
                    {section.isVisible ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              );
            }}
          />
        </div>

        <PreviewPanel device={previewDevice} onDeviceChange={setPreviewDevice}>
          <div className="min-h-[400px] bg-background">
            {visibleSections.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Add sections to preview your homepage
              </div>
            ) : (
              visibleSections.map((section) => {
                const meta = HOMEPAGE_SECTION_META[section.type];
                return (
                  <div
                    key={section.id}
                    className="border-b border-border px-4 py-8 text-center last:border-0"
                  >
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{meta.label}</p>
                    <h3 className="mt-1 text-lg font-bold">{section.title ?? meta.label}</h3>
                    {section.subtitle && (
                      <p className="mt-1 text-sm text-muted-foreground">{section.subtitle}</p>
                    )}
                    <div className="mx-auto mt-4 h-24 max-w-md rounded-lg bg-muted/50" />
                  </div>
                );
              })
            )}
          </div>
        </PreviewPanel>
      </div>
    </CmsShell>
  );
}
