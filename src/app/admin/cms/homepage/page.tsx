'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Zap, Settings as SettingsIcon } from 'lucide-react';
import { SectionManager } from '@/components/admin/homepage/SectionManager';
import { TopNavigation } from '@/components/page-builder/cms/TopNavigation';
import { LeftSidebar } from '@/components/page-builder/cms/LeftSidebar';
import { VisualCanvas } from '@/components/page-builder/cms/VisualCanvas';
import { RightInspector } from '@/components/page-builder/cms/RightInspector';
import { AIAssistant } from '@/components/page-builder/cms/AIAssistant';
import { CommandPalette } from '@/components/page-builder/cms/CommandPalette';
import { PublishDialog } from '@/components/page-builder/cms/PublishDialog';
import { useHomepageBuilder } from '@/components/page-builder/cms/hooks/useHomepageBuilder';
import toast from 'react-hot-toast';

export default function HomepageBuilderPage() {
  const [showAI, setShowAI] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [activeTab, setActiveTab] = useState<'visual' | 'sections' | 'settings' | 'analytics'>('visual');
  
  const {
    sections,
    selectedSection,
    selectedDevice,
    theme,
    selectSection,
    updateSection,
    addSection,
    removeSection,
    duplicateSection,
    reorderSections,
    setDevice,
    undo,
    redo,
    canUndo,
    canRedo,
    saveDraft,
    publish,
    isSaving,
    isPublishing,
    lastSaved,
    status,
  } = useHomepageBuilder();

  // Handle save with toast notification
  const handleSaveDraft = async () => {
    try {
      await saveDraft();
      toast.success('Draft saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save draft');
    }
  };

  // Handle publish with toast notification
  const handlePublish = async () => {
    try {
      await publish();
      toast.success('Homepage published successfully');
      setShowPublishDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish');
    }
  };

  // Auto-save with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (sections.length > 0) {
        try {
          await saveDraft();
          console.log('[AUTO_SAVE] Saved automatically');
        } catch (error) {
          console.error('[AUTO_SAVE] Failed:', error);
        }
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [sections, saveDraft]);

  return (
    <div className="flex flex-col bg-background rounded-xl border border-border/40 overflow-hidden" style={{ height: 'calc(100vh - 10rem)' }}>
      {/* Tab Navigation */}
      <div className="border-b border-border/40 bg-muted/30 p-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="bg-background border border-border/40">
            <TabsTrigger value="visual" className="gap-2">
              Visual Builder
            </TabsTrigger>
            <TabsTrigger value="sections" className="gap-2">
              <Zap className="w-4 h-4" />
              Sections Manager
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 overflow-hidden">
        <TabsContent value="visual" className="overflow-hidden">
      {/* Top Navigation */}
      <TopNavigation
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onSaveDraft={handleSaveDraft}
        onPublish={() => setShowPublishDialog(true)}
        onToggleAI={() => setShowAI(!showAI)}
        onShowCommandPalette={() => setShowCommandPalette(true)}
        device={selectedDevice}
        onDeviceChange={setDevice}
        isSaving={isSaving}
        isPublishing={isPublishing}
        lastSaved={lastSaved}
        status={status}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar
          sections={sections}
          selectedSection={selectedSection}
          onSelectSection={selectSection}
          onAddSection={addSection}
          onRemoveSection={removeSection}
          onDuplicateSection={duplicateSection}
          onReorderSections={reorderSections}
        />

        {/* Visual Canvas */}
        <VisualCanvas
          sections={sections}
          selectedSection={selectedSection}
          device={selectedDevice}
          orientation={orientation}
          theme={theme}
          onSelectSection={selectSection}
          onUpdateSection={updateSection}
          onDeviceChange={setDevice}
          onOrientationChange={setOrientation}
        />

        {/* Right Inspector */}
        <RightInspector
          section={selectedSection}
          theme={theme}
          onUpdateSection={updateSection}
          onUpdateTheme={() => {}}
        />
      </div>

      {/* AI Assistant */}
      <AnimatePresence>
        {showAI && (
          <AIAssistant
            onClose={() => setShowAI(false)}
            onGenerate={(prompt) => {
              console.log('AI Generate:', prompt);
            }}
          />
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <AnimatePresence>
        {showCommandPalette && (
          <CommandPalette
            onClose={() => setShowCommandPalette(false)}
            onSelect={(action) => {
              console.log('Command:', action);
              setShowCommandPalette(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Publish Dialog */}
      <AnimatePresence>
        {showPublishDialog && (
          <PublishDialog
            onClose={() => setShowPublishDialog(false)}
            onPublish={handlePublish}
          />
        )}
      </AnimatePresence>
        </TabsContent>

        <TabsContent value="sections" className="overflow-auto p-6">
          <SectionManager
            sections={sections.map((s: any) => ({
              id: s.id,
              type: s.type,
              title: s.title,
              displayOrder: s.displayOrder,
              isVisible: s.isVisible,
              config: s.config || {},
              impressions: s.impressions,
              clicks: s.clicks,
              conversions: s.conversions,
            }))}
            onSectionsChange={(updatedSections) => {
              // Update sections through the builder hook
              sections.forEach((s: any, idx: number) => {
                if (updatedSections[idx]?.displayOrder !== s.displayOrder) {
                  reorderSections(idx, updatedSections[idx]?.displayOrder || 0);
                }
                if (updatedSections[idx]?.isVisible !== s.isVisible) {
                  updateSection(s.id, { isVisible: updatedSections[idx]?.isVisible });
                }
              });
            }}
            onEditSection={(section) => selectSection(section.id)}
            onDeleteSection={removeSection}
            onSave={handleSaveDraft}
            isLoading={isSaving}
          />
        </TabsContent>

        <TabsContent value="analytics" className="overflow-auto p-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Section Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4">Section</th>
                    <th className="text-right py-2 px-4">Views</th>
                    <th className="text-right py-2 px-4">Clicks</th>
                    <th className="text-right py-2 px-4">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section: any) => (
                    <tr key={section.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-2 px-4">{section.title || section.type}</td>
                      <td className="text-right py-2 px-4">
                        {(section.impressions || 0).toLocaleString()}
                      </td>
                      <td className="text-right py-2 px-4">
                        {(section.clicks || 0).toLocaleString()}
                      </td>
                      <td className="text-right py-2 px-4">
                        {section.clicks
                          ? (((section.conversions || 0) / section.clicks) * 100).toFixed(1)
                          : "0"}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="overflow-auto p-6">
          <div className="max-w-2xl space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Page Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Page Status</label>
                  <select className="w-full border border-border rounded-lg p-2 bg-background">
                    <option>Draft</option>
                    <option>Published</option>
                    <option>Scheduled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
