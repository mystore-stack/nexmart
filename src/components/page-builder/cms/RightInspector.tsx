'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  Type,
  Layout as LayoutIcon,
  Palette,
  Image as ImageIcon,
  Sparkles,
  Smartphone,
  Eye,
  Globe,
  Sliders,
  Code,
  Box,
  Square,
  Layers,
  MousePointer2,
  Shield,
  Gauge,
  Zap,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize,
  Minimize,
  Move3D,
  Waves,
  MousePointerClick,
  Clock,
  Accessibility,
  FileCode,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Section, Theme } from './types';

interface RightInspectorProps {
  section: Section | null;
  theme: Theme;
  onUpdateSection: (id: string, updates: Partial<Section>) => void;
  onUpdateTheme: (updates: Partial<Theme>) => void;
}

const INSPECTOR_TABS = [
  { id: 'general', name: 'General', icon: Settings },
  { id: 'content', name: 'Content', icon: Type },
  { id: 'layout', name: 'Layout', icon: LayoutIcon },
  { id: 'spacing', name: 'Spacing', icon: Box },
  { id: 'design', name: 'Design', icon: Palette },
  { id: 'typography', name: 'Typography', icon: Type },
  { id: 'border', name: 'Border', icon: Square },
  { id: 'radius', name: 'Radius', icon: Maximize },
  { id: 'shadow', name: 'Shadow', icon: Layers },
  { id: 'effects', name: 'Effects', icon: Sparkles },
  { id: 'animation', name: 'Animation', icon: Waves },
  { id: 'responsive', name: 'Responsive', icon: Smartphone },
  { id: 'interactions', name: 'Interactions', icon: MousePointer2 },
  { id: 'conditions', name: 'Conditions', icon: Shield },
  { id: 'seo', name: 'SEO', icon: Globe },
  { id: 'accessibility', name: 'Accessibility', icon: Accessibility },
  { id: 'performance', name: 'Performance', icon: Gauge },
  { id: 'advanced', name: 'Advanced', icon: Sliders },
];

export function RightInspector({
  section,
  theme,
  onUpdateSection,
  onUpdateTheme
}: RightInspectorProps) {
  const [activeTab, setActiveTab] = useState('general');

  if (!section) {
    return (
      <motion.aside
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-[360px] border-l border-border/40 bg-background/50 backdrop-blur-sm flex flex-col"
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 mx-auto mb-4 flex items-center justify-center">
            <Settings className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Section Selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a section from the canvas or sidebar to edit its properties
          </p>
        </div>
      </motion.aside>
    );
  }

  return (
    <motion.aside
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-[360px] border-l border-border/40 bg-background/50 backdrop-blur-sm flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{section.name}</h3>
          <Switch
            checked={section.enabled}
            onCheckedChange={(checked: boolean) => onUpdateSection(section.id, { enabled: checked })}
          />
        </div>
        <Input
          value={section.id}
          disabled
          className="h-8 text-xs text-muted-foreground"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-5 gap-1 p-2 h-auto">
          {INSPECTOR_TABS.slice(0, 5).map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="h-8 p-0 data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-600"
              title={tab.name}
            >
              <tab.icon className="w-4 h-4" />
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsList className="grid grid-cols-5 gap-1 p-2 h-auto mt-1">
          {INSPECTOR_TABS.slice(5, 10).map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="h-8 p-0 data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-600"
              title={tab.name}
            >
              <tab.icon className="w-4 h-4" />
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsList className="grid grid-cols-5 gap-1 p-2 h-auto mt-1">
          {INSPECTOR_TABS.slice(10, 15).map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="h-8 p-0 data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-600"
              title={tab.name}
            >
              <tab.icon className="w-4 h-4" />
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsList className="grid grid-cols-4 gap-1 p-2 h-auto mt-1">
          {INSPECTOR_TABS.slice(15).map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="h-8 p-0 data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-600"
              title={tab.name}
            >
              <tab.icon className="w-4 h-4" />
            </TabsTrigger>
          ))}
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* General Tab */}
            <TabsContent value="general" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Section Name</Label>
                <Input
                  value={section.name}
                  onChange={(e) => onUpdateSection(section.id, { name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Section ID</Label>
                <Input
                  value={section.id}
                  disabled
                  className="text-muted-foreground"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Enabled</Label>
                <Switch
                  checked={section.enabled}
                  onCheckedChange={(checked: boolean) => onUpdateSection(section.id, { enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Visible</Label>
                <Switch
                  checked={section.visible}
                  onCheckedChange={(checked: boolean) => onUpdateSection(section.id, { visible: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Locked</Label>
                <Switch
                  checked={section.locked}
                  onCheckedChange={(checked: boolean) => onUpdateSection(section.id, { locked: checked })}
                />
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={section.content?.title || ''}
                  onChange={(e) => onUpdateSection(section.id, {
                    content: { ...section.content, title: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={section.content?.subtitle || ''}
                  onChange={(e) => onUpdateSection(section.id, {
                    content: { ...section.content, subtitle: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={section.content?.description || ''}
                  onChange={(e) => onUpdateSection(section.id, {
                    content: { ...section.content, description: e.target.value }
                  })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Button Text</Label>
                <Input
                  value={section.content?.cta || ''}
                  onChange={(e) => onUpdateSection(section.id, {
                    content: { ...section.content, cta: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Link</Label>
                <Input
                  value={section.content?.ctaLink || ''}
                  onChange={(e) => onUpdateSection(section.id, {
                    content: { ...section.content, ctaLink: e.target.value }
                  })}
                />
              </div>
            </TabsContent>

            {/* Design Tab */}
            <TabsContent value="design" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={section.design?.color || '#000000'}
                    onChange={(e) => onUpdateSection(section.id, {
                      design: { ...section.design, color: e.target.value }
                    })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={section.design?.color || '#000000'}
                    onChange={(e) => onUpdateSection(section.id, {
                      design: { ...section.design, color: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Border Radius</Label>
                <Select
                  value={section.design?.radius || '16px'}
                  onValueChange={(value) => onUpdateSection(section.id, {
                    design: { ...section.design, radius: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0px">None</SelectItem>
                    <SelectItem value="8px">Small</SelectItem>
                    <SelectItem value="16px">Medium</SelectItem>
                    <SelectItem value="24px">Large</SelectItem>
                    <SelectItem value="32px">XLarge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Shadow</Label>
                <Select
                  value={section.design?.shadow || 'none'}
                  onValueChange={(value) => onUpdateSection(section.id, {
                    design: { ...section.design, shadow: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">XLarge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Width</Label>
                <Select
                  value={section.layout?.width || '100%'}
                  onValueChange={(value) => onUpdateSection(section.id, {
                    layout: { ...section.layout, width: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100%">Full Width</SelectItem>
                    <SelectItem value="container">Container</SelectItem>
                    <SelectItem value="narrow">Narrow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Padding</Label>
                <Input
                  value={section.layout?.padding || '0'}
                  onChange={(e) => onUpdateSection(section.id, {
                    layout: { ...section.layout, padding: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Margin</Label>
                <Input
                  value={section.layout?.margin || '0'}
                  onChange={(e) => onUpdateSection(section.id, {
                    layout: { ...section.layout, margin: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Alignment</Label>
                <Select
                  value={section.layout?.alignment || 'left'}
                  onValueChange={(value: "left" | "center" | "right") => onUpdateSection(section.id, {
                    layout: { ...section.layout, alignment: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Spacing Tab */}
            <TabsContent value="spacing" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Padding</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Top</span>
                    <Input placeholder="16px" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Bottom</span>
                    <Input placeholder="16px" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Left</span>
                    <Input placeholder="16px" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Right</span>
                    <Input placeholder="16px" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Margin</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Top</span>
                    <Input placeholder="0px" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Bottom</span>
                    <Input placeholder="0px" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Left</span>
                    <Input placeholder="0px" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Right</span>
                    <Input placeholder="0px" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gap</Label>
                <Input placeholder="16px" />
              </div>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select defaultValue="inter">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="poppins">Poppins</SelectItem>
                    <SelectItem value="playfair">Playfair Display</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Input placeholder="16px" />
              </div>
              <div className="space-y-2">
                <Label>Font Weight</Label>
                <Select defaultValue="400">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">Light</SelectItem>
                    <SelectItem value="400">Regular</SelectItem>
                    <SelectItem value="500">Medium</SelectItem>
                    <SelectItem value="600">Semibold</SelectItem>
                    <SelectItem value="700">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Line Height</Label>
                <Input placeholder="1.5" />
              </div>
              <div className="space-y-2">
                <Label>Letter Spacing</Label>
                <Input placeholder="0px" />
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-12 h-10 p-1" />
                  <Input placeholder="#000000" />
                </div>
              </div>
            </TabsContent>

            {/* Border Tab */}
            <TabsContent value="border" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Border Width</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Top</span>
                    <Input placeholder="0px" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Bottom</span>
                    <Input placeholder="0px" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Left</span>
                    <Input placeholder="0px" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Right</span>
                    <Input placeholder="0px" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Border Style</Label>
                <Select defaultValue="solid">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Border Color</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-12 h-10 p-1" />
                  <Input placeholder="#000000" />
                </div>
              </div>
            </TabsContent>

            {/* Radius Tab */}
            <TabsContent value="radius" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Border Radius</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Top Left</span>
                    <Input placeholder="16px" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Top Right</span>
                    <Input placeholder="16px" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Bottom Left</span>
                    <Input placeholder="16px" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Bottom Right</span>
                    <Input placeholder="16px" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex-1 h-8 text-xs bg-muted rounded hover:bg-muted/80 transition-colors">
                  Link All
                </button>
                <button className="flex-1 h-8 text-xs bg-muted rounded hover:bg-muted/80 transition-colors">
                  Unlink
                </button>
              </div>
            </TabsContent>

            {/* Shadow Tab */}
            <TabsContent value="shadow" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Shadow Preset</Label>
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">XLarge</SelectItem>
                    <SelectItem value="2xl">2XL</SelectItem>
                    <SelectItem value="inner">Inner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Shadow Color</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-12 h-10 p-1" />
                  <Input placeholder="#000000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Shadow Blur</Label>
                <Input placeholder="10px" />
              </div>
              <div className="space-y-2">
                <Label>Shadow Spread</Label>
                <Input placeholder="0px" />
              </div>
            </TabsContent>

            {/* Effects Tab */}
            <TabsContent value="effects" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Blur</Label>
                <Input placeholder="0px" />
              </div>
              <div className="space-y-2">
                <Label>Backdrop Blur</Label>
                <Input placeholder="0px" />
              </div>
              <div className="space-y-2">
                <Label>Opacity</Label>
                <Input type="range" min="0" max="100" defaultValue="100" />
              </div>
              <div className="space-y-2">
                <Label>Blend Mode</Label>
                <Select defaultValue="normal">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="multiply">Multiply</SelectItem>
                    <SelectItem value="screen">Screen</SelectItem>
                    <SelectItem value="overlay">Overlay</SelectItem>
                    <SelectItem value="darken">Darken</SelectItem>
                    <SelectItem value="lighten">Lighten</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Transform</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Rotate X" />
                  <Input placeholder="Rotate Y" />
                  <Input placeholder="Scale X" />
                  <Input placeholder="Scale Y" />
                </div>
              </div>
            </TabsContent>

            {/* Interactions Tab */}
            <TabsContent value="interactions" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Hover Effect</Label>
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="scale">Scale</SelectItem>
                    <SelectItem value="lift">Lift</SelectItem>
                    <SelectItem value="glow">Glow</SelectItem>
                    <SelectItem value="shake">Shake</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Click Effect</Label>
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="ripple">Ripple</SelectItem>
                    <SelectItem value="bounce">Bounce</SelectItem>
                    <SelectItem value="pulse">Pulse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Transition Duration</Label>
                <Input placeholder="200ms" />
              </div>
              <div className="space-y-2">
                <Label>Easing</Label>
                <Select defaultValue="ease">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ease">Ease</SelectItem>
                    <SelectItem value="ease-in">Ease In</SelectItem>
                    <SelectItem value="ease-out">Ease Out</SelectItem>
                    <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                    <SelectItem value="linear">Linear</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Conditions Tab */}
            <TabsContent value="conditions" className="space-y-4 mt-0">
              <div className="space-y-3">
                <Label>Visibility Conditions</Label>
                {['Guest', 'Customer', 'Seller', 'Admin', 'VIP'].map((role) => (
                  <div key={role} className="flex items-center justify-between">
                    <Label>{role}</Label>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-border/40 space-y-3">
                <Label>Device Visibility</Label>
                <div className="flex items-center justify-between">
                  <Label>Hide on Desktop</Label>
                  <Switch defaultChecked={false} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Hide on Tablet</Label>
                  <Switch defaultChecked={false} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Hide on Mobile</Label>
                  <Switch defaultChecked={false} />
                </div>
              </div>
              <div className="pt-4 border-t border-border/40 space-y-2">
                <Label>Custom Condition</Label>
                <Textarea placeholder="Enter custom condition..." rows={3} />
              </div>
            </TabsContent>

            {/* Accessibility Tab */}
            <TabsContent value="accessibility" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>ARIA Label</Label>
                <Input placeholder="Descriptive label for screen readers" />
              </div>
              <div className="space-y-2">
                <Label>ARIA Description</Label>
                <Textarea placeholder="Additional description" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="button">Button</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="navigation">Navigation</SelectItem>
                    <SelectItem value="region">Region</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Skip Navigation</Label>
                <Switch defaultChecked={false} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Focus Visible</Label>
                <Switch defaultChecked={true} />
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4 mt-0">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Lazy Load Images</Label>
                  <Switch defaultChecked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Lazy Load Videos</Label>
                  <Switch defaultChecked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Preload Critical CSS</Label>
                  <Switch defaultChecked={false} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Image Optimization</Label>
                <Select defaultValue="auto">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="webp">WebP Only</SelectItem>
                    <SelectItem value="original">Original</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority Level</Label>
                <Select defaultValue="normal">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Background Tab */}
            <TabsContent value="background" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Background Type</Label>
                <Select
                  value={section.design?.backgroundType || 'solid'}
                  onValueChange={(value: "solid" | "gradient" | "image" | "video") => onUpdateSection(section.id, {
                    design: { ...section.design, backgroundType: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid Color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={section.design?.background || '#ffffff'}
                    onChange={(e) => onUpdateSection(section.id, {
                      design: { ...section.design, background: e.target.value }
                    })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={section.design?.background || '#ffffff'}
                    onChange={(e) => onUpdateSection(section.id, {
                      design: { ...section.design, background: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gradient (if selected)</Label>
                <Input placeholder="linear-gradient(to right, #fff, #000)" />
              </div>
              <div className="space-y-2">
                <Label>Background Image URL</Label>
                <Input placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Background Size</Label>
                <Select defaultValue="cover">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Background Position</Label>
                <Select defaultValue="center">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Animation Tab */}
            <TabsContent value="animation" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Animation Type</Label>
                <Select
                  value={section.animation?.type || 'none'}
                  onValueChange={(value: "none" | "fade" | "zoom" | "slide" | "scale") => onUpdateSection(section.id, {
                    animation: { ...section.animation, type: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                    <SelectItem value="scale">Scale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (ms)</Label>
                <Input
                  type="number"
                  value={section.animation?.duration || 300}
                  onChange={(e) => onUpdateSection(section.id, {
                    animation: { ...section.animation, duration: parseInt(e.target.value) }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Delay (ms)</Label>
                <Input
                  type="number"
                  value={section.animation?.delay || 0}
                  onChange={(e) => onUpdateSection(section.id, {
                    animation: { ...section.animation, delay: parseInt(e.target.value) }
                  })}
                />
              </div>
            </TabsContent>

            {/* Responsive Tab */}
            <TabsContent value="responsive" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Desktop</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="p-4 rounded-lg border border-border/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tablet</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="p-4 rounded-lg border border-border/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Mobile</span>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </TabsContent>

            {/* Visibility Tab */}
            <TabsContent value="visibility" className="space-y-4 mt-0">
              <div className="space-y-3">
                {['Guest', 'Customer', 'Seller', 'Admin', 'VIP'].map((role) => (
                  <div key={role} className="flex items-center justify-between">
                    <Label>{role}</Label>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-border/40 space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Hide on Desktop</Label>
                  <Switch defaultChecked={false} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Hide on Mobile</Label>
                  <Switch defaultChecked={false} />
                </div>
              </div>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input placeholder="Enter meta title" />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  placeholder="Enter meta description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>OpenGraph Image</Label>
                <Input placeholder="Image URL" />
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Custom CSS</Label>
                <Textarea
                  placeholder=".custom-class { }"
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label>Custom JavaScript</Label>
                <Textarea
                  placeholder="// Custom JS"
                  rows={4}
                  className="font-mono text-xs"
                />
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </motion.aside>
  );
}
