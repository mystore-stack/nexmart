'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    </div>
  );
}
