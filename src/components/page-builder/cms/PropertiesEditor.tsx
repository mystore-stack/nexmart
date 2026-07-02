'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
  Move,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Image,
  Video,
  Sparkles,
  Droplets,
  Square,
  Circle,
  Box,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { ColorPicker } from '@/components/ui/color-picker';
import { GradientEditor } from '@/components/ui/gradient-editor';
import { SpacingControl } from '@/components/ui/spacing-control';
import { SliderControl } from '@/components/ui/slider-control';
import { IconButton } from '@/components/ui/icon-button';

interface PropertiesEditorProps {
  properties: any;
  onChange: (properties: any) => void;
}

export function PropertiesEditor({ properties, onChange }: PropertiesEditorProps) {
  const [activeTab, setActiveTab] = useState('layout');

  const updateProperty = (path: string, value: any) => {
    const keys = path.split('.');
    const newProperties = { ...properties };
    let current = newProperties;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onChange(newProperties);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-4 gap-1 p-2 h-auto">
          <TabsTrigger value="layout" className="h-8 p-0 data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-600">
            <Layers className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="spacing" className="h-8 p-0 data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-600">
            <Box className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="background" className="h-8 p-0 data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-600">
            <Image className="w-4 h-4" aria-hidden="true" />
          </TabsTrigger>
          <TabsTrigger value="effects" className="h-8 p-0 data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-600">
            <Sparkles className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-4 mt-0">
              {/* Display */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Display</Label>
                <SegmentedControl
                  options={[
                    { value: 'block', label: 'Block' },
                    { value: 'flex', label: 'Flex' },
                    { value: 'grid', label: 'Grid' },
                    { value: 'inline', label: 'Inline' }
                  ]}
                  value={properties.layout?.display || 'block'}
                  onChange={(value) => updateProperty('layout.display', value)}
                />
              </div>

              {/* Flex Options */}
              {properties.layout?.display === 'flex' && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                  <Label className="text-sm font-medium">Flex Options</Label>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Direction</Label>
                    <SegmentedControl
                      options={[
                        { value: 'row', label: 'Row' },
                        { value: 'column', label: 'Column' },
                        { value: 'row-reverse', label: 'Row Reverse' }
                      ]}
                      value={properties.layout?.flexDirection || 'row'}
                      onChange={(value) => updateProperty('layout.flexDirection', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Justify Content</Label>
                    <Select
                      value={properties.layout?.justifyContent || 'flex-start'}
                      onValueChange={(value) => updateProperty('layout.justifyContent', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                        <SelectItem value="space-between">Space Between</SelectItem>
                        <SelectItem value="space-around">Space Around</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Align Items</Label>
                    <Select
                      value={properties.layout?.alignItems || 'stretch'}
                      onValueChange={(value) => updateProperty('layout.alignItems', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stretch">Stretch</SelectItem>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Gap</Label>
                    <Input
                      type="text"
                      value={properties.layout?.gap || '0'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('layout.gap', e.target.value)}
                      placeholder="16px"
                    />
                  </div>
                </div>
              )}

              {/* Grid Options */}
              {properties.layout?.display === 'grid' && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                  <Label className="text-sm font-medium">Grid Options</Label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Columns</Label>
                      <Input
                        type="text"
                        value={properties.layout?.gridColumns || '1fr'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('layout.gridColumns', e.target.value)}
                        placeholder="repeat(3, 1fr)"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Rows</Label>
                      <Input
                        type="text"
                        value={properties.layout?.gridRows || 'auto'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('layout.gridRows', e.target.value)}
                        placeholder="auto"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Gap</Label>
                    <Input
                      type="text"
                      value={properties.layout?.gap || '0'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('layout.gap', e.target.value)}
                      placeholder="16px"
                    />
                  </div>
                </div>
              )}

              {/* Position */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Position</Label>
                <SegmentedControl
                  options={[
                    { value: 'static', label: 'Static' },
                    { value: 'relative', label: 'Relative' },
                    { value: 'absolute', label: 'Absolute' },
                    { value: 'fixed', label: 'Fixed' }
                  ]}
                  value={properties.layout?.position || 'static'}
                  onChange={(value) => updateProperty('layout.position', value)}
                />
              </div>

              {/* Position Offsets */}
              {(properties.layout?.position === 'absolute' || properties.layout?.position === 'fixed') && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Top</Label>
                    <Input
                      type="text"
                      value={properties.layout?.top || 'auto'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('layout.top', e.target.value)}
                      placeholder="auto"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bottom</Label>
                    <Input
                      type="text"
                      value={properties.layout?.bottom || 'auto'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('layout.bottom', e.target.value)}
                      placeholder="auto"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Left</Label>
                    <Input
                      type="text"
                      value={properties.layout?.left || 'auto'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('layout.left', e.target.value)}
                      placeholder="auto"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Right</Label>
                    <Input
                      type="text"
                      value={properties.layout?.right || 'auto'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('layout.right', e.target.value)}
                      placeholder="auto"
                    />
                  </div>
                </div>
              )}

              {/* Z-Index */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Z-Index</Label>
                <Input
                  type="number"
                  value={properties.layout?.zIndex || 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('layout.zIndex', parseInt(e.target.value))}
                  placeholder="0"
                />
              </div>

              {/* Overflow */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Overflow</Label>
                <Select
                  value={properties.layout?.overflow || 'visible'}
                  onValueChange={(value) => updateProperty('layout.overflow', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visible">Visible</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                    <SelectItem value="scroll">Scroll</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Visibility */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Visible</Label>
                  <Switch
                    checked={properties.visibility?.visible !== false}
                    onCheckedChange={(checked: boolean) => updateProperty('visibility.visible', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Opacity</Label>
                  <span className="text-xs text-muted-foreground">{Math.round((properties.visibility?.opacity || 1) * 100)}%</span>
                </div>
                <SliderControl
                  value={(properties.visibility?.opacity || 1) * 100}
                  onChange={(value) => updateProperty('visibility.opacity', value / 100)}
                  min={0}
                  max={100}
                  showValue={false}
                />
              </div>
            </TabsContent>

            {/* Spacing Tab */}
            <TabsContent value="spacing" className="space-y-4 mt-0">
              <SpacingControl
                value={properties.spacing?.padding || { top: '0', right: '0', bottom: '0', left: '0' }}
                onChange={(value) => updateProperty('spacing.padding', value)}
                label="Padding"
                linked={properties.spacing?.paddingLinked || false}
                onToggleLinked={() => updateProperty('spacing.paddingLinked', !properties.spacing?.paddingLinked)}
              />

              <SpacingControl
                value={properties.spacing?.margin || { top: '0', right: '0', bottom: '0', left: '0' }}
                onChange={(value) => updateProperty('spacing.margin', value)}
                label="Margin"
                linked={properties.spacing?.marginLinked || false}
                onToggleLinked={() => updateProperty('spacing.marginLinked', !properties.spacing?.marginLinked)}
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Gap</Label>
                <Input
                  type="text"
                  value={properties.spacing?.gap || '0'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('spacing.gap', e.target.value)}
                  placeholder="16px"
                />
              </div>
            </TabsContent>

            {/* Background Tab */}
            <TabsContent value="background" className="space-y-4 mt-0">
              {/* Background Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Background Type</Label>
                <SegmentedControl
                  options={[
                    { value: 'solid', label: 'Solid' },
                    { value: 'gradient', label: 'Gradient' },
                    { value: 'image', label: 'Image' },
                    { value: 'video', label: 'Video' }
                  ]}
                  value={properties.background?.type || 'solid'}
                  onChange={(value) => updateProperty('background.type', value)}
                />
              </div>

              {/* Solid Color */}
              {properties.background?.type === 'solid' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Color</Label>
                  <ColorPicker
                    value={properties.background?.color || '#ffffff'}
                    onChange={(value) => updateProperty('background.color', value)}
                    presets={['#ffffff', '#000000', '#0F766E', '#D4AF37', '#C25B33']}
                  />
                </div>
              )}

              {/* Gradient */}
              {properties.background?.type === 'gradient' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Gradient</Label>
                  <GradientEditor
                    value={properties.background?.gradient || 'linear-gradient(90deg, #0F766E, #D4AF37)'}
                    onChange={(value) => updateProperty('background.gradient', value)}
                  />
                </div>
              )}

              {/* Image */}
              {properties.background?.type === 'image' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Image URL</Label>
                    <Input
                      value={properties.background?.imageUrl || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('background.imageUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Size</Label>
                    <Select
                      value={properties.background?.size || 'cover'}
                      onValueChange={(value) => updateProperty('background.size', value)}
                    >
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
                    <Label className="text-sm font-medium">Position</Label>
                    <Select
                      value={properties.background?.position || 'center'}
                      onValueChange={(value) => updateProperty('background.position', value)}
                    >
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

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Repeat</Label>
                    <Select
                      value={properties.background?.repeat || 'no-repeat'}
                      onValueChange={(value) => updateProperty('background.repeat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-repeat">No Repeat</SelectItem>
                        <SelectItem value="repeat">Repeat</SelectItem>
                        <SelectItem value="repeat-x">Repeat X</SelectItem>
                        <SelectItem value="repeat-y">Repeat Y</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Image Overlay */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Overlay Color</Label>
                    <ColorPicker
                      value={properties.background?.overlayColor || 'rgba(0,0,0,0)'}
                      onChange={(value) => updateProperty('background.overlayColor', value)}
                    />
                  </div>
                </div>
              )}

              {/* Video */}
              {properties.background?.type === 'video' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Video URL</Label>
                    <Input
                      value={properties.background?.videoUrl || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('background.videoUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Muted</Label>
                    <Switch
                      checked={properties.background?.videoMuted || true}
                      onCheckedChange={(checked: boolean) => updateProperty('background.videoMuted', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Loop</Label>
                    <Switch
                      checked={properties.background?.videoLoop || true}
                      onCheckedChange={(checked: boolean) => updateProperty('background.videoLoop', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Overlay Color</Label>
                    <ColorPicker
                      value={properties.background?.overlayColor || 'rgba(0,0,0,0.5)'}
                      onChange={(value) => updateProperty('background.overlayColor', value)}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Effects Tab */}
            <TabsContent value="effects" className="space-y-4 mt-0">
              {/* Border */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Border</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Width</Label>
                    <Input
                      type="text"
                      value={properties.effects?.borderWidth || '0'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('effects.borderWidth', e.target.value)}
                      placeholder="1px"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Style</Label>
                    <Select
                      value={properties.effects?.borderStyle || 'solid'}
                      onValueChange={(value) => updateProperty('effects.borderStyle', value)}
                    >
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
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Color</Label>
                  <ColorPicker
                    value={properties.effects?.borderColor || '#000000'}
                    onChange={(value) => updateProperty('effects.borderColor', value)}
                  />
                </div>
              </div>

              {/* Border Radius */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Border Radius</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Top Left</Label>
                    <Input
                      type="text"
                      value={properties.effects?.borderRadiusTopLeft || '0'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('effects.borderRadiusTopLeft', e.target.value)}
                      placeholder="8px"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Top Right</Label>
                    <Input
                      type="text"
                      value={properties.effects?.borderRadiusTopRight || '0'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('effects.borderRadiusTopRight', e.target.value)}
                      placeholder="8px"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bottom Left</Label>
                    <Input
                      type="text"
                      value={properties.effects?.borderRadiusBottomLeft || '0'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('effects.borderRadiusBottomLeft', e.target.value)}
                      placeholder="8px"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bottom Right</Label>
                    <Input
                      type="text"
                      value={properties.effects?.borderRadiusBottomRight || '0'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('effects.borderRadiusBottomRight', e.target.value)}
                      placeholder="8px"
                    />
                  </div>
                </div>
              </div>

              {/* Shadow */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Shadow</Label>
                <Select
                  value={properties.effects?.shadow || 'none'}
                  onValueChange={(value) => updateProperty('effects.shadow', value)}
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
                    <SelectItem value="2xl">2XL</SelectItem>
                    <SelectItem value="inner">Inner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Blur */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Blur</Label>
                <SliderControl
                  value={properties.effects?.blur || 0}
                  onChange={(value) => updateProperty('effects.blur', value)}
                  min={0}
                  max={100}
                  unit="px"
                />
              </div>

              {/* Backdrop Blur */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Backdrop Blur (Glass Effect)</Label>
                <SliderControl
                  value={properties.effects?.backdropBlur || 0}
                  onChange={(value) => updateProperty('effects.backdropBlur', value)}
                  min={0}
                  max={100}
                  unit="px"
                />
              </div>

              {/* Blend Mode */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Blend Mode</Label>
                <Select
                  value={properties.effects?.blendMode || 'normal'}
                  onValueChange={(value) => updateProperty('effects.blendMode', value)}
                >
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
                    <SelectItem value="color-dodge">Color Dodge</SelectItem>
                    <SelectItem value="color-burn">Color Burn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transform */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <Label className="text-sm font-medium">Transform</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Rotate X</Label>
                    <Input
                      type="text"
                      value={properties.effects?.transformRotateX || '0deg'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('effects.transformRotateX', e.target.value)}
                      placeholder="0deg"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Rotate Y</Label>
                    <Input
                      type="text"
                      value={properties.effects?.transformRotateY || '0deg'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('effects.transformRotateY', e.target.value)}
                      placeholder="0deg"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Scale X</Label>
                    <Input
                      type="text"
                      value={properties.effects?.transformScaleX || '1'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('effects.transformScaleX', e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Scale Y</Label>
                    <Input
                      type="text"
                      value={properties.effects?.transformScaleY || '1'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProperty('effects.transformScaleY', e.target.value)}
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
