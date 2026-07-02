"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PageSection } from "@prisma/client";
import { ContentTab } from "./inspector/ContentTab";
import { StyleTab } from "./inspector/StyleTab";
import { LayoutTab } from "./inspector/LayoutTab";
import { AnimationTab } from "./inspector/AnimationTab";
import { AdvancedTab } from "./inspector/AdvancedTab";

interface InspectorPanelProps {
  section: PageSection;
  onUpdate: (section: PageSection) => void;
}

export function InspectorPanel({ section, onUpdate }: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState("content");

  const handleUpdate = (updates: Partial<PageSection>) => {
    onUpdate?.({ ...section, ...updates });
  };

  const handleConfigUpdate = (configUpdates: any) => {
    onUpdate?.({
      ...section,
      config: { ...section.config, ...configUpdates },
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Section Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">{section.sectionType}</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-4 border-b border-border">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
            <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
            <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
            <TabsTrigger value="animation" className="text-xs">Animation</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <AnimatePresence mode="wait">
              {activeTab === "content" && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <ContentTab section={section} onConfigUpdate={handleConfigUpdate} />
                </motion.div>
              )}

              {activeTab === "style" && (
                <motion.div
                  key="style"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <StyleTab section={section} onUpdate={handleUpdate} />
                </motion.div>
              )}

              {activeTab === "layout" && (
                <motion.div
                  key="layout"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <LayoutTab section={section} onUpdate={handleUpdate} />
                </motion.div>
              )}

              {activeTab === "animation" && (
                <motion.div
                  key="animation"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <AnimationTab section={section} onConfigUpdate={handleConfigUpdate} />
                </motion.div>
              )}

              {activeTab === "advanced" && (
                <motion.div
                  key="advanced"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <AdvancedTab section={section} onUpdate={handleUpdate} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
