'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play,
  Pause,
  RotateCcw,
  Clock,
  Zap,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  MousePointer2,
  Sparkles,
  Eye,
  Layers
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SliderControl } from '@/components/ui/slider-control';
import { IconButton } from '@/components/ui/icon-button';

interface AnimationEditorProps {
  animation: any;
  onChange: (animation: any) => void;
}

export function AnimationEditor({ animation, onChange }: AnimationEditorProps) {
  const [activeTab, setActiveTab] = useState('entrance');
  const [isPlaying, setIsPlaying] = useState(false);

  const updateAnimation = (path: string, value: any) => {
    const keys = path.split('.');
    const newAnimation = { ...animation };
    let current = newAnimation;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onChange(newAnimation);
  };

  const animationTypes = [
    { value: 'none', label: 'None', icon: null },
    { value: 'fade', label: 'Fade', icon: <Eye className="w-4 h-4" /> },
    { value: 'slide', label: 'Slide', icon: <ArrowRight className="w-4 h-4" /> },
    { value: 'zoom', label: 'Zoom', icon: <Maximize2 className="w-4 h-4" /> },
    { value: 'scale', label: 'Scale', icon: <Layers className="w-4 h-4" /> },
    { value: 'rotate', label: 'Rotate', icon: <RefreshCw className="w-4 h-4" /> },
    { value: 'parallax', label: 'Parallax', icon: <Layers className="w-4 h-4" /> },
    { value: 'bounce', label: 'Bounce', icon: <Sparkles className="w-4 h-4" /> },
    { value: 'flip', label: 'Flip', icon: <RefreshCw className="w-4 h-4" /> },
  ];

  const easingOptions = [
    { value: 'linear', label: 'Linear' },
    { value: 'ease', label: 'Ease' },
    { value: 'ease-in', label: 'Ease In' },
    { value: 'ease-out', label: 'Ease Out' },
    { value: 'ease-in-out', label: 'Ease In Out' },
    { value: 'spring', label: 'Spring' },
    { value: 'anticipate', label: 'Anticipate' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/40 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Animation Editor</h3>
          <div className="flex gap-1">
            <IconButton
              icon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              tooltip={isPlaying ? 'Pause' : 'Play'}
            />
            <IconButton
              icon={<RotateCcw className="w-4 h-4" />}
              variant="ghost"
              size="sm"
              tooltip="Reset"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-4 gap-1 p-2 h-auto">
          <TabsTrigger value="entrance" className="h-8 p-0 data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-600">
            <ArrowUp className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="hover" className="h-8 p-0 data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-600">
            <MousePointer2 className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="click" className="h-8 p-0 data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-600">
            <Sparkles className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="scroll" className="h-8 p-0 data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-600">
            <Layers className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Entrance Tab */}
            <TabsContent value="entrance" className="space-y-4 mt-0">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Animation Type</Label>
                <Select
                  value={animation.entrance?.type || 'none'}
                  onValueChange={(value) => updateAnimation('entrance.type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {animationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {animation.entrance?.type !== 'none' && (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Direction</Label>
                    <SegmentedControl
                      options={[
                        { value: 'up', label: 'Up', icon: <ArrowUp className="w-4 h-4" /> },
                        { value: 'down', label: 'Down', icon: <ArrowDown className="w-4 h-4" /> },
                        { value: 'left', label: 'Left', icon: <ArrowLeft className="w-4 h-4" /> },
                        { value: 'right', label: 'Right', icon: <ArrowRight className="w-4 h-4" /> }
                      ]}
                      value={animation.entrance?.direction || 'up'}
                      onChange={(value) => updateAnimation('entrance.direction', value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Duration</Label>
                    <SliderControl
                      value={animation.entrance?.duration || 600}
                      onChange={(value) => updateAnimation('entrance.duration', value)}
                      min={100}
                      max={3000}
                      step={100}
                      unit="ms"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Delay</Label>
                    <SliderControl
                      value={animation.entrance?.delay || 0}
                      onChange={(value) => updateAnimation('entrance.delay', value)}
                      min={0}
                      max={2000}
                      step={100}
                      unit="ms"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Easing</Label>
                    <Select
                      value={animation.entrance?.easing || 'ease'}
                      onValueChange={(value) => updateAnimation('entrance.easing', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {easingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {animation.entrance?.easing === 'spring' && (
                    <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                      <Label className="text-sm font-medium">Spring Physics</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-xs">Stiffness</Label>
                          <span className="text-xs text-muted-foreground">{animation.entrance?.stiffness || 100}</span>
                        </div>
                        <SliderControl
                          value={animation.entrance?.stiffness || 100}
                          onChange={(value) => updateAnimation('entrance.stiffness', value)}
                          min={10}
                          max={300}
                          showValue={false}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-xs">Damping</Label>
                          <span className="text-xs text-muted-foreground">{animation.entrance?.damping || 10}</span>
                        </div>
                        <SliderControl
                          value={animation.entrance?.damping || 10}
                          onChange={(value) => updateAnimation('entrance.damping', value)}
                          min={1}
                          max={50}
                          showValue={false}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Loop</Label>
                    <Switch
                      checked={animation.entrance?.loop || false}
                      onCheckedChange={(checked: boolean) => updateAnimation('entrance.loop', checked)}
                    />
                  </div>

                  {animation.entrance?.loop && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Loop Type</Label>
                      <Select
                        value={animation.entrance?.loopType || 'infinite'}
                        onValueChange={(value) => updateAnimation('entrance.loopType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="infinite">Infinite</SelectItem>
                          <SelectItem value="reverse">Reverse</SelectItem>
                          <SelectItem value="mirror">Mirror</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Hover Tab */}
            <TabsContent value="hover" className="space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Enable Hover Animation</Label>
                <Switch
                  checked={animation.hover?.enabled || false}
                  onCheckedChange={(checked: boolean) => updateAnimation('hover.enabled', checked)}
                />
              </div>

              {animation.hover?.enabled && (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Animation Type</Label>
                    <Select
                      value={animation.hover?.type || 'scale'}
                      onValueChange={(value) => updateAnimation('hover.type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {animationTypes.filter(t => t.value !== 'parallax').map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Duration</Label>
                    <SliderControl
                      value={animation.hover?.duration || 300}
                      onChange={(value) => updateAnimation('hover.duration', value)}
                      min={100}
                      max={1000}
                      step={50}
                      unit="ms"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Easing</Label>
                    <Select
                      value={animation.hover?.easing || 'ease'}
                      onValueChange={(value) => updateAnimation('hover.easing', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {easingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {animation.hover?.type === 'scale' && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Scale Amount</Label>
                      <SliderControl
                        value={(animation.hover?.scale || 1.1) * 100}
                        onChange={(value) => updateAnimation('hover.scale', value / 100)}
                        min={100}
                        max={150}
                        unit="%"
                      />
                    </div>
                  )}

                  {animation.hover?.type === 'zoom' && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Zoom Amount</Label>
                      <SliderControl
                        value={(animation.hover?.zoom || 1.1) * 100}
                        onChange={(value) => updateAnimation('hover.zoom', value / 100)}
                        min={100}
                        max={150}
                        unit="%"
                      />
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Click Tab */}
            <TabsContent value="click" className="space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Enable Click Animation</Label>
                <Switch
                  checked={animation.click?.enabled || false}
                  onCheckedChange={(checked: boolean) => updateAnimation('click.enabled', checked)}
                />
              </div>

              {animation.click?.enabled && (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Animation Type</Label>
                    <Select
                      value={animation.click?.type || 'bounce'}
                      onValueChange={(value) => updateAnimation('click.type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {animationTypes.filter(t => t.value !== 'parallax').map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Duration</Label>
                    <SliderControl
                      value={animation.click?.duration || 300}
                      onChange={(value) => updateAnimation('click.duration', value)}
                      min={100}
                      max={1000}
                      step={50}
                      unit="ms"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Easing</Label>
                    <Select
                      value={animation.click?.easing || 'spring'}
                      onValueChange={(value) => updateAnimation('click.easing', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {easingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Scroll Tab */}
            <TabsContent value="scroll" className="space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Enable Scroll Animation</Label>
                <Switch
                  checked={animation.scroll?.enabled || false}
                  onCheckedChange={(checked: boolean) => updateAnimation('scroll.enabled', checked)}
                />
              </div>

              {animation.scroll?.enabled && (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Animation Type</Label>
                    <Select
                      value={animation.scroll?.type || 'fade'}
                      onValueChange={(value) => updateAnimation('scroll.type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="slide">Slide</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="parallax">Parallax</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Trigger Point</Label>
                    <SliderControl
                      value={animation.scroll?.trigger || 80}
                      onChange={(value) => updateAnimation('scroll.trigger', value)}
                      min={0}
                      max={100}
                      unit="%"
                    />
                    <p className="text-xs text-muted-foreground">
                      Animation triggers when element is {animation.scroll?.trigger || 80}% visible
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Duration</Label>
                    <SliderControl
                      value={animation.scroll?.duration || 600}
                      onChange={(value) => updateAnimation('scroll.duration', value)}
                      min={200}
                      max={2000}
                      step={100}
                      unit="ms"
                    />
                  </div>

                  {animation.scroll?.type === 'parallax' && (
                    <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                      <Label className="text-sm font-medium">Parallax Settings</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-xs">Speed</Label>
                          <span className="text-xs text-muted-foreground">{animation.scroll?.speed || 0.5}</span>
                        </div>
                        <SliderControl
                          value={(animation.scroll?.speed || 0.5) * 100}
                          onChange={(value) => updateAnimation('scroll.speed', value / 100)}
                          min={0}
                          max={100}
                          showValue={false}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Repeat on Scroll</Label>
                    <Switch
                      checked={animation.scroll?.repeat || false}
                      onCheckedChange={(checked: boolean) => updateAnimation('scroll.repeat', checked)}
                    />
                  </div>
                </>
              )}
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
