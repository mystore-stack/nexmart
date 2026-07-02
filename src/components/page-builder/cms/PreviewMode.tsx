'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor,
  Tablet,
  Smartphone,
  Moon,
  Sun,
  WifiOff,
  Globe,
  Search,
  X,
  RefreshCw,
  ChevronDown,
  Eye,
  Share2,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SegmentedControl } from '@/components/ui/segmented-control';

interface PreviewModeProps {
  isOpen: boolean;
  onClose: () => void;
  content: React.ReactNode;
}

export function PreviewMode({ isOpen, onClose, content }: PreviewModeProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'phone'>('desktop');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [network, setNetwork] = useState<'online' | 'offline' | 'slow'>('online');
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [activeTab, setActiveTab] = useState('preview');

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    phone: '375px'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background z-50 flex flex-col"
        >
          {/* Header */}
          <div className="border-b border-border/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <h3 className="font-semibold">Preview Mode</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Device Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Device:</span>
                <SegmentedControl
                  options={[
                    { value: 'desktop', label: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
                    { value: 'tablet', label: 'Tablet', icon: <Tablet className="w-4 h-4" /> },
                    { value: 'phone', label: 'Phone', icon: <Smartphone className="w-4 h-4" /> }
                  ]}
                  value={device}
                  onChange={(value) => setDevice(value as any)}
                />
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Theme:</span>
                <SegmentedControl
                  options={[
                    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
                    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> }
                  ]}
                  value={theme}
                  onChange={(value) => setTheme(value as any)}
                />
              </div>

              {/* Network */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Network:</span>
                <Select value={network} onValueChange={(value) => setNetwork(value as any)}>
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">
                      <div className="flex items-center gap-2">
                        <WifiOff className="w-4 h-4 text-green-500" />
                        Online
                      </div>
                    </SelectItem>
                    <SelectItem value="slow">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-yellow-500" />
                        Slow
                      </div>
                    </SelectItem>
                    <SelectItem value="offline">
                      <div className="flex items-center gap-2">
                        <WifiOff className="w-4 h-4 text-red-500" />
                        Offline
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Direction */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Direction:</span>
                <SegmentedControl
                  options={[
                    { value: 'ltr', label: 'LTR' },
                    { value: 'rtl', label: 'RTL' }
                  ]}
                  value={direction}
                  onChange={(value) => setDirection(value as any)}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3 w-64 mx-auto mt-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="opengraph">OpenGraph</TabsTrigger>
            </TabsList>

            {/* Preview Tab */}
            <TabsContent value="preview" className="flex-1 mt-4">
              <div className="h-full flex items-center justify-center bg-muted/30 p-8">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`bg-background rounded-lg shadow-2xl overflow-hidden border border-border/40 transition-all duration-300`}
                  style={{ width: deviceWidths[device], maxHeight: '90vh' }}
                >
                  {/* Device Frame */}
                  {device === 'phone' && (
                    <div className="bg-black rounded-t-lg p-2 flex items-center justify-between">
                      <div className="w-16 h-4 bg-black rounded-full mx-auto" />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div 
                    className={`h-full overflow-auto ${theme === 'dark' ? 'dark' : ''}`}
                    style={{ direction }}
                  >
                    {network === 'offline' && (
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-300 text-sm">
                        <div className="flex items-center gap-2">
                          <WifiOff className="w-4 h-4" />
                          <span>Offline Mode - Content loaded from cache</span>
                        </div>
                      </div>
                    )}
                    {network === 'slow' && (
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-sm">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Slow Network - Loading...</span>
                        </div>
                      </div>
                    )}
                    {content}
                  </div>
                </motion.div>
              </div>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="flex-1 mt-4 p-8">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">SEO Preview</h3>
                </div>

                {/* Google Search Result */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border/40 bg-background">
                    <div className="space-y-2">
                      <div className="text-xl text-blue-600 hover:underline cursor-pointer">
                        NexMart - Moroccan Luxury Marketplace
                      </div>
                      <div className="text-sm text-green-700">
                        https://www.nexmart.ma
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Discover the finest Moroccan luxury products. Premium shopping experience with curated collections from the best Moroccan artisans. Shop now for exclusive deals.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-border/40 bg-muted/50">
                    <h4 className="font-medium mb-3">Meta Tags</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Title:</span>
                        <span>NexMart - Moroccan Luxury Marketplace</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Description:</span>
                        <span className="max-w-md truncate">Discover the finest Moroccan luxury products...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Keywords:</span>
                        <span>Moroccan, luxury, marketplace, shopping, artisan</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* OpenGraph Tab */}
            <TabsContent value="opengraph" className="flex-1 mt-4 p-8">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Share2 className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">OpenGraph Preview</h3>
                </div>

                {/* Social Media Cards */}
                <div className="space-y-6">
                  {/* Facebook */}
                  <div className="p-4 rounded-lg border border-border/40 bg-background">
                    <div className="flex items-center gap-2 mb-3 text-blue-600">
                      <Globe className="w-4 h-4" />
                      <span className="font-medium">Facebook</span>
                    </div>
                    <div className="border border-border/40 rounded overflow-hidden">
                      <div className="h-48 bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                        <span className="text-white font-semibold">Preview Image</span>
                      </div>
                      <div className="p-3 bg-muted/30">
                        <div className="text-sm font-medium text-blue-600">NexMart - Moroccan Luxury Marketplace</div>
                        <div className="text-xs text-muted-foreground">nexmart.ma</div>
                        <div className="text-sm mt-1">Discover the finest Moroccan luxury products...</div>
                      </div>
                    </div>
                  </div>

                  {/* Twitter */}
                  <div className="p-4 rounded-lg border border-border/40 bg-background">
                    <div className="flex items-center gap-2 mb-3 text-blue-400">
                      <Share2 className="w-4 h-4" />
                      <span className="font-medium">Twitter/X</span>
                    </div>
                    <div className="border border-border/40 rounded overflow-hidden">
                      <div className="h-48 bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                        <span className="text-white font-semibold">Preview Image</span>
                      </div>
                      <div className="p-3 bg-muted/30">
                        <div className="text-sm font-medium">NexMart - Moroccan Luxury Marketplace</div>
                        <div className="text-xs text-muted-foreground">nexmart.ma</div>
                      </div>
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div className="p-4 rounded-lg border border-border/40 bg-background">
                    <div className="flex items-center gap-2 mb-3 text-blue-700">
                      <Globe className="w-4 h-4" />
                      <span className="font-medium">LinkedIn</span>
                    </div>
                    <div className="border border-border/40 rounded overflow-hidden">
                      <div className="h-48 bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                        <span className="text-white font-semibold">Preview Image</span>
                      </div>
                      <div className="p-3 bg-muted/30">
                        <div className="text-sm font-medium text-blue-600">NexMart - Moroccan Luxury Marketplace</div>
                        <div className="text-xs text-muted-foreground">nexmart.ma</div>
                        <div className="text-sm mt-1">Discover the finest Moroccan luxury products...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
