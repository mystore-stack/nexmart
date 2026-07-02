"use client";

import React, { useState } from "react";
import { X, Settings, Layout, Palette, Type, Layers } from "lucide-react";
import type { PageSection, SectionConfig } from "../types";
import {
  FormField,
  TextInput,
  TextArea,
  ColorPicker,
  Select,
  Slider,
  Toggle,
  ImageUpload,
  ButtonConfig,
} from "./FormField";

interface SectionSettingsPanelProps {
  section: PageSection;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (sectionId: string, config: Partial<SectionConfig>) => void;
}

export const SectionSettingsPanel = React.memo(function SectionSettingsPanel({
  section,
  isOpen,
  onClose,
  onUpdate,
}: SectionSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<"content" | "style" | "layout">("content");
  const [config, setConfig] = useState<SectionConfig>(section.config);

  const handleConfigChange = (key: keyof SectionConfig, value: unknown) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate(section.id, { [key]: value });
  };

  const handleNestedConfigChange = (parentKey: string, childKey: string, value: unknown) => {
    const parentValue = (config as Record<string, unknown>)[parentKey];
    const newConfig = {
      ...config,
      [parentKey]: {
        ...(typeof parentValue === 'object' && parentValue !== null ? parentValue : {}),
        [childKey]: value,
      },
    };
    setConfig(newConfig);
    onUpdate(section.id, { [parentKey]: (newConfig as Record<string, unknown>)[parentKey] });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Section Settings</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "content"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Type className="w-4 h-4" />
          Content
        </button>
        <button
          onClick={() => setActiveTab("style")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "style"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Palette className="w-4 h-4" />
          Style
        </button>
        <button
          onClick={() => setActiveTab("layout")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "layout"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Layout className="w-4 h-4" />
          Layout
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === "content" && <ContentTab config={config} onChange={handleConfigChange} />}
        {activeTab === "style" && <StyleTab config={config} onChange={handleConfigChange} />}
        {activeTab === "layout" && <LayoutTab config={config} onChange={handleConfigChange} />}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Done
        </button>
      </div>
    </div>
  );
});

const ContentTab = ({ config, onChange }: { config: SectionConfig; onChange: (key: keyof SectionConfig, value: unknown) => void }) => {
  const configRecord = config as Record<string, unknown>;

  return (
    <div className="space-y-4">
      <FormField label="Title" description="Main heading for the section">
        <TextInput
          value={((configRecord.title as string) || "")}
          onChange={(value) => onChange("title", value)}
          placeholder="Enter title"
        />
      </FormField>

      <FormField label="Subtitle" description="Secondary heading or subtext">
        <TextInput
          value={((configRecord.subtitle as string) || "")}
          onChange={(value) => onChange("subtitle", value)}
          placeholder="Enter subtitle"
        />
      </FormField>

      <FormField label="Description" description="Additional text content">
        <TextArea
          value={((configRecord.description as string) || "")}
          onChange={(value) => onChange("description", value)}
          placeholder="Enter description"
          rows={4}
        />
      </FormField>

      {Boolean(configRecord.badge) && (
        <FormField label="Badge Text" description="Small promotional badge">
          <TextInput
            value={(configRecord.badge as string) || ""}
            onChange={(value) => onChange("badge" as keyof SectionConfig, value)}
            placeholder="Enter badge text"
          />
        </FormField>
      )}

      {Array.isArray(configRecord.buttons) && (
        <FormField label="Buttons" description="Call-to-action buttons">
          <div className="space-y-3">
            {(configRecord.buttons as Array<Record<string, unknown>>).map((button: Record<string, unknown>, index: number) => (
              <ButtonConfig
                key={index}
                value={button as { text: string; link?: string; bgColor?: string; textColor?: string }}
                onChange={(value) => {
                  const buttons = [...(configRecord.buttons as Array<Record<string, unknown>>)];
                  if (value === null) {
                    buttons.splice(index, 1);
                  } else {
                    buttons[index] = value;
                  }
                  onChange("buttons" as keyof SectionConfig, buttons);
                }}
                index={index}
              />
            ))}
            <button
              onClick={() => {
                const buttons = [...((configRecord.buttons as Array<Record<string, unknown>>) || []), { text: "New Button" }];
                onChange("buttons" as keyof SectionConfig, buttons);
              }}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
            >
              + Add Button
            </button>
          </div>
        </FormField>
      )}

      {typeof configRecord.content === "string" && (
        <FormField label="HTML Content" description="Custom HTML content">
          <TextArea
            value={(configRecord.content as string) || ""}
            onChange={(value) => onChange("content" as keyof SectionConfig, value)}
            placeholder="Enter HTML"
            rows={8}
          />
        </FormField>
      )}
    </div>
  );
};

const StyleTab = ({ config, onChange }: { config: SectionConfig; onChange: (key: keyof SectionConfig, value: unknown) => void }) => {
  const configRecord = config as Record<string, unknown>;

  return (
    <div className="space-y-4">
      <FormField label="Background Color" description="Section background color">
        <ColorPicker
          value={((configRecord.backgroundColor as string) || "#FFFFFF")}
          onChange={(value) => onChange("backgroundColor", value)}
        />
      </FormField>

      <FormField label="Background Image" description="Section background image URL">
        <ImageUpload
          value={((configRecord.backgroundImage as string) || "")}
          onChange={(value) => onChange("backgroundImage", value)}
        />
      </FormField>

      {Boolean(configRecord.backgroundImage) && (
        <>
          <FormField label="Overlay Color" description="Color overlay for background image">
            <ColorPicker
              value={((configRecord.overlayColor as string) || "#000000")}
              onChange={(value) => onChange("overlayColor", value)}
            />
          </FormField>

          <FormField label="Overlay Opacity" description="Opacity of the overlay (0-1)">
            <Slider
              value={((configRecord.overlayOpacity as number) || 0)}
              onChange={(value) => onChange("overlayOpacity", value)}
              min={0}
              max={1}
              step={0.1}
            />
          </FormField>
        </>
      )}

      <FormField label="Text Color" description="Default text color for the section">
        <ColorPicker
          value={((configRecord.textColor as string) || "#111827")}
          onChange={(value) => onChange("textColor", value)}
        />
      </FormField>

      <FormField label="Button Background Color" description="Background color for buttons">
        <ColorPicker
          value={((configRecord.buttonBgColor as string) || "#0F766E")}
          onChange={(value) => onChange("buttonBgColor", value)}
        />
      </FormField>

      <FormField label="Button Text Color" description="Text color for buttons">
        <ColorPicker
          value={((configRecord.buttonTextColor as string) || "#FFFFFF")}
          onChange={(value) => onChange("buttonTextColor", value)}
        />
      </FormField>

      <FormField label="Border Radius" description="Corner radius for elements">
        <TextInput
          value={((configRecord.borderRadius as string) || "0px")}
          onChange={(value) => onChange("borderRadius", value)}
          placeholder="e.g., 8px, 1rem"
        />
      </FormField>

      <FormField label="Shadow" description="CSS shadow for elements">
        <TextInput
          value={((configRecord.shadow as string) || "")}
          onChange={(value) => onChange("shadow", value)}
          placeholder="e.g., 0 4px 6px rgba(0,0,0,0.1)"
        />
      </FormField>
    </div>
  );
};

const LayoutTab = ({ config, onChange }: { config: SectionConfig; onChange: (key: keyof SectionConfig, value: unknown) => void }) => {
  const configRecord = config as Record<string, unknown>;

  return (
    <div className="space-y-4">
      <FormField label="Text Alignment" description="Horizontal alignment of text content">
        <Select
          value={((configRecord.textAlign as string) || "left")}
          onChange={(value) => onChange("textAlign", value)}
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
        />
      </FormField>

      <FormField label="Spacing" description="Vertical spacing for the section">
        <Select
          value={((configRecord.spacing as string) || "medium")}
          onChange={(value) => onChange("spacing", value)}
          options={[
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
          ]}
        />
      </FormField>

      <FormField label="Padding" description="Custom padding for the section">
        <TextInput
          value={((configRecord.padding as string) || "")}
          onChange={(value) => onChange("padding", value)}
          placeholder="e.g., 2rem, 32px"
        />
      </FormField>

      <FormField label="Margin" description="Custom margin for the section">
        <TextInput
          value={((configRecord.margin as string) || "")}
          onChange={(value) => onChange("margin", value)}
          placeholder="e.g., 1rem, 16px"
        />
      </FormField>

      <FormField label="Visibility" description="Device visibility for the section">
        <Select
          value={((configRecord.visibility as string) || "all")}
          onChange={(value) => onChange("visibility", value)}
          options={[
            { value: "all", label: "All Devices" },
            { value: "desktop", label: "Desktop Only" },
            { value: "mobile", label: "Mobile Only" },
            { value: "tablet", label: "Tablet Only" },
          ]}
        />
      </FormField>

      <FormField label="Custom CSS Classes" description="Additional CSS classes for custom styling">
        <TextInput
          value={((configRecord.customCssClasses as string) || "")}
          onChange={(value) => onChange("customCssClasses", value)}
          placeholder="e.g., custom-section, my-class"
        />
      </FormField>

      <FormField label="Animation" description="CSS animation for the section">
        <TextInput
          value={((configRecord.animation as string) || "")}
          onChange={(value) => onChange("animation", value)}
          placeholder="e.g., fade-in, slide-up"
        />
      </FormField>
    </div>
  );
};
