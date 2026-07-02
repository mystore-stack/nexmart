'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GripVertical,
  MoreVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Edit2,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3x3,
  Ruler,
  Move,
  Layers,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  RotateCw,
  Crosshair,
  BoxSelect,
  Group,
  Ungroup,
  Save,
  Bot,
  MessageSquare,
  History,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Section, Theme } from './types';

interface VisualCanvasProps {
  sections: Section[];
  selectedSection: Section | null;
  device: 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'small-mobile';
  orientation: 'portrait' | 'landscape';
  theme: Theme;
  onSelectSection: (section: Section) => void;
  onUpdateSection: (id: string, updates: Partial<Section>) => void;
  onDeviceChange: (device: 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'small-mobile') => void;
  onOrientationChange: (orientation: 'portrait' | 'landscape') => void;
}

const DEVICE_WIDTHS = {
  desktop: { width: '100%', maxWidth: '1200px' },
  laptop: { width: '1024px', maxWidth: '1024px' },
  tablet: { width: '768px', maxWidth: '768px' },
  mobile: { width: '375px', maxWidth: '375px' },
  'small-mobile': { width: '320px', maxWidth: '320px' }
};

const DEVICE_HEIGHTS = {
  desktop: '100%',
  laptop: '768px',
  tablet: '1024px',
  mobile: '667px',
  'small-mobile': '568px'
};

export function VisualCanvas({
  sections,
  selectedSection,
  device,
  orientation,
  theme,
  onSelectSection,
  onUpdateSection,
  onDeviceChange,
  onOrientationChange
}: VisualCanvasProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const canvasRef = useRef<HTMLDivElement>(null);

  const renderSectionPreview = (section: Section) => {
    switch (section.type) {
      case 'hero-banner':
        return (
          <div className="relative h-[500px] bg-gradient-to-br from-brand-500/20 to-brand-600/20 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-display font-bold text-foreground">
                  {section.content?.title || 'Welcome to NexMart'}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {section.content?.subtitle || 'Discover the finest Moroccan luxury products'}
                </p>
                <Button className="bg-brand-500 hover:bg-brand-600">
                  {section.content?.cta || 'Shop Now'}
                </Button>
              </div>
            </div>
          </div>
        );
      case 'features':
        return (
          <div className="grid grid-cols-3 gap-6 p-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-xl bg-muted/50 border border-border/40">
                <div className="w-12 h-12 rounded-lg bg-brand-500/10 mb-4 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-brand-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Feature {i}</h3>
                <p className="text-sm text-muted-foreground">Description text here</p>
              </div>
            ))}
          </div>
        );
      case 'featured-products':
        return (
          <div className="grid grid-cols-4 gap-6 p-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group">
                <div className="aspect-square rounded-xl bg-muted/50 border border-border/40 mb-3 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
                </div>
                <h3 className="font-medium mb-1">Product {i}</h3>
                <p className="text-sm text-muted-foreground">$99.99</p>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="p-8 rounded-xl bg-muted/50 border border-border/40">
            <p className="text-center text-muted-foreground">{section.name} Section</p>
          </div>
        );
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 bg-muted/30 overflow-hidden flex flex-col"
    >
      {/* Canvas Header */}
      <div className="h-14 border-b border-border/40 bg-background/50 backdrop-blur-sm flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Homepage</span>
          <Badge variant="outline" className="text-xs">
            {sections.length} sections
          </Badge>
          <div className="w-px h-4 bg-border/40" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom(Math.max(25, zoom - 10))}
              className="h-7 w-7 p-0 hover:bg-muted rounded flex items-center justify-center transition-colors"
              title="Zoom Out (⌘-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(400, zoom + 10))}
              className="h-7 w-7 p-0 hover:bg-muted rounded flex items-center justify-center transition-colors"
              title="Zoom In (⌘+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="h-7 w-7 p-0 hover:bg-muted rounded flex items-center justify-center transition-colors"
              title="Reset Zoom (⌘0)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          <div className="w-px h-4 bg-border/40" />
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`h-7 w-7 p-0 hover:bg-muted rounded flex items-center justify-center transition-colors ${showGrid ? 'bg-brand-500/10 text-brand-600' : ''}`}
            title="Toggle Grid (⌘G)"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowRulers(!showRulers)}
            className={`h-7 w-7 p-0 hover:bg-muted rounded flex items-center justify-center transition-colors ${showRulers ? 'bg-brand-500/10 text-brand-600' : ''}`}
            title="Toggle Rulers (⌘R)"
          >
            <Ruler className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowGuides(!showGuides)}
            className={`h-7 w-7 p-0 hover:bg-muted rounded flex items-center justify-center transition-colors ${showGuides ? 'bg-brand-500/10 text-brand-600' : ''}`}
            title="Toggle Guides (⌘⇧G)"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPanning(!isPanning)}
            className={`h-7 w-7 p-0 hover:bg-muted rounded flex items-center justify-center transition-colors ${isPanning ? 'bg-brand-500/10 text-brand-600' : ''}`}
            title="Pan Mode (Space)"
          >
            <Move className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Switcher */}
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border/40">
            <button
              onClick={() => onDeviceChange('desktop')}
              className={`h-7 w-7 p-0 rounded flex items-center justify-center transition-colors ${device === 'desktop' ? 'bg-brand-500 text-white' : 'hover:bg-muted'}`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeviceChange('laptop')}
              className={`h-7 w-7 p-0 rounded flex items-center justify-center transition-colors ${device === 'laptop' ? 'bg-brand-500 text-white' : 'hover:bg-muted'}`}
              title="Laptop"
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeviceChange('tablet')}
              className={`h-7 w-7 p-0 rounded flex items-center justify-center transition-colors ${device === 'tablet' ? 'bg-brand-500 text-white' : 'hover:bg-muted'}`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeviceChange('mobile')}
              className={`h-7 w-7 p-0 rounded flex items-center justify-center transition-colors ${device === 'mobile' ? 'bg-brand-500 text-white' : 'hover:bg-muted'}`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Orientation Toggle */}
          {device !== 'desktop' && device !== 'laptop' && (
            <button
              onClick={() => onOrientationChange(orientation === 'portrait' ? 'landscape' : 'portrait')}
              className="h-7 w-7 p-0 hover:bg-muted rounded flex items-center justify-center transition-colors"
              title={`Toggle Orientation (${orientation})`}
            >
              <RotateCw className="w-4 h-4" />
            </button>
          )}

          <div className="w-px h-4 bg-border/40" />
          <Badge variant="outline" className="text-xs capitalize">
            {device} {orientation !== 'portrait' && orientation}
          </Badge>
        </div>
      </div>

      {/* Canvas Content */}
      <div 
        ref={canvasRef}
        className="flex-1 overflow-auto relative"
        style={{ cursor: isPanning ? 'grab' : 'default' }}
      >
        {/* Grid Background */}
        {showGrid && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: `${20 * (zoom / 100)}px ${20 * (zoom / 100)}px`
            }}
          />
        )}

        {/* Rulers */}
        {showRulers && (
          <>
            <div className="absolute top-0 left-0 right-0 h-6 bg-muted/80 border-b border-border/40 flex items-center px-2 text-[10px] text-muted-foreground">
              {Array.from({ length: 20 }).map((_, i) => (
                <span key={i} className="flex-1 text-center">{i * 100}</span>
              ))}
            </div>
            <div className="absolute top-0 left-0 bottom-0 w-6 bg-muted/80 border-r border-border/40 flex flex-col items-center py-2 text-[10px] text-muted-foreground">
              {Array.from({ length: 20 }).map((_, i) => (
                <span key={i} className="flex-1 text-center -rotate-90">{i * 100}</span>
              ))}
            </div>
          </>
        )}

        {/* Canvas Area */}
        <div 
          className="relative mx-auto transition-all duration-300"
          style={{
            marginTop: showRulers ? '24px' : '32px',
            marginLeft: showRulers ? '24px' : '32px',
            transform: `scale(${zoom / 100}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'top left',
            width: DEVICE_WIDTHS[device]?.width,
            maxWidth: DEVICE_WIDTHS[device]?.maxWidth,
            minHeight: DEVICE_HEIGHTS[device] || 'auto',
            border: device !== 'desktop' ? '2px solid hsl(var(--border))' : 'none',
            borderRadius: device !== 'desktop' ? '16px' : '0',
            overflow: 'hidden',
            backgroundColor: 'white'
          }}
        >
          {/* Safe Area Indicator */}
          {device !== 'desktop' && (
            <div className="absolute inset-4 border-2 border-dashed border-brand-500/30 rounded-lg pointer-events-none z-50" />
          )}

          <div className="space-y-0">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative group transition-all duration-200 ${
                  selectedSection?.id === section.id || selectedSections.has(section.id)
                    ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-background'
                    : ''
                } ${!section.visible ? 'opacity-50' : ''}`}
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                {/* Enhanced Section Toolbar */}
                <AnimatePresence>
                  {hoveredSection === section.id || selectedSection?.id === section.id || selectedSections.has(section.id) ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute -top-14 left-1/2 -translate-x-1/2 z-20"
                    >
                      <div className="flex items-center gap-1 p-1 bg-background rounded-lg shadow-luxury border border-border/40">
                        <button className="h-8 w-8 p-0 hover:bg-muted rounded flex items-center justify-center" title="Move">
                          <Move className="w-4 h-4" />
                        </button>
                        <button className="h-8 w-8 p-0 hover:bg-muted rounded flex items-center justify-center" title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          className="h-8 w-8 p-0 hover:bg-muted rounded flex items-center justify-center"
                          onClick={() => onUpdateSection(section.id, { visible: !section.visible })}
                          title={section.visible ? 'Hide' : 'Show'}
                        >
                          {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button className="h-8 w-8 p-0 hover:bg-muted rounded flex items-center justify-center" title="Lock">
                          {section.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                        <div className="w-px h-4 bg-border/40 mx-1" />
                        <button className="h-8 w-8 p-0 hover:bg-muted rounded flex items-center justify-center" title="Settings">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="h-8 w-8 p-0 hover:bg-muted rounded flex items-center justify-center" title="Analytics">
                          <TrendingUp className="w-4 h-4" />
                        </button>
                        <button className="h-8 w-8 p-0 hover:bg-muted rounded flex items-center justify-center" title="Preview">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="h-8 w-8 p-0 hover:bg-muted rounded flex items-center justify-center text-brand-600" title="AI Edit">
                          <Bot className="w-4 h-4" />
                        </button>
                        <button className="h-8 w-8 p-0 hover:bg-muted rounded flex items-center justify-center" title="Comments">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="h-8 w-8 p-0 hover:bg-muted rounded flex items-center justify-center" title="Version History">
                          <History className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-border/40 mx-1" />
                        <button className="h-8 w-8 p-0 hover:bg-muted rounded flex items-center justify-center" title="Group">
                          <Group className="w-4 h-4" />
                        </button>
                        <button className="h-8 w-8 p-0 hover:bg-muted rounded flex items-center justify-center" title="Save as Component">
                          <Save className="w-4 h-4" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-8 w-8 p-0 hover:bg-muted rounded flex items-center justify-center">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Group className="w-4 h-4 mr-2" />
                              Group Selection
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Save className="w-4 h-4 mr-2" />
                              Save as Component
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Layers className="w-4 h-4 mr-2" />
                              Convert to Global
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              {section.visible ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Show
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              {section.locked ? (
                                <>
                                  <Unlock className="w-4 h-4 mr-2" />
                                  Unlock
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4 mr-2" />
                                  Lock
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Section Content */}
                <div
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => onSelectSection(section)}
                  style={{
                    backgroundColor: section.design?.background || 'transparent',
                    padding: section.layout?.padding || '0',
                    margin: section.layout?.margin || '0'
                  }}
                >
                  {renderSectionPreview(section)}
                </div>

                {/* Section Info Bar */}
                <div className="absolute bottom-2 left-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                    {section.name}
                  </Badge>
                  {section.locked && (
                    <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.main>
  );
}
