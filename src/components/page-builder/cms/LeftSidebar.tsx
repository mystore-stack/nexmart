'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Layers,
  Square,
  Image as ImageIcon,
  Palette,
  Settings,
  Search,
  Globe,
  BarChart3,
  History,
  ChevronDown,
  ChevronRight,
  Plus,
  GripVertical,
  MoreVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Edit2,
  Star,
  Clock,
  Sparkles,
  Folder,
  Package,
  Navigation as NavIcon,
  Footprints,
  TrendingUp,
  Zap,
  Component,
  Blocks,
  Bookmark,
  Heart,
  Bot,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Section } from './types';

interface LeftSidebarProps {
  sections: Section[];
  selectedSection: Section | null;
  onSelectSection: (section: Section) => void;
  onAddSection: (type: string) => void;
  onRemoveSection: (id: string) => void;
  onDuplicateSection: (id: string) => void;
  onReorderSections: (fromIndex: number, toIndex: number) => void;
}

const SECTION_TYPES = [
  { id: 'announcement-bar', name: 'Announcement Bar', icon: Layout },
  { id: 'hero-banner', name: 'Hero Banner', icon: Layout },
  { id: 'features', name: 'Features', icon: Square },
  { id: 'categories', name: 'Categories', icon: Layers },
  { id: 'flash-sale', name: 'Flash Sale', icon: Layout },
  { id: 'super-deals', name: 'Super Deals', icon: Layout },
  { id: 'featured-products', name: 'Featured Products', icon: Square },
  { id: 'best-sellers', name: 'Best Sellers', icon: Square },
  { id: 'trending', name: 'Trending', icon: Square },
  { id: 'new-arrivals', name: 'New Arrivals', icon: Square },
  { id: 'brands', name: 'Brands', icon: ImageIcon },
  { id: 'collections', name: 'Collections', icon: Layers },
  { id: 'promotional-banner', name: 'Promotional Banner', icon: Layout },
  { id: 'testimonials', name: 'Testimonials', icon: Square },
  { id: 'blog', name: 'Blog', icon: Square },
  { id: 'newsletter', name: 'Newsletter', icon: Square },
  { id: 'footer', name: 'Footer', icon: Layout },
];

const SIDEBAR_SECTIONS = [
  { id: 'favorites', name: 'Favorites', icon: Heart, count: 5, shortcut: '⌘F', defaultOpen: true },
  { id: 'recent', name: 'Recently Used', icon: Clock, count: 12, shortcut: '⌘R', defaultOpen: false },
  { id: 'sections', name: 'Sections', icon: Layers, count: 18, shortcut: '⌘S', defaultOpen: true },
  { id: 'templates', name: 'Templates', icon: Layout, count: 24, shortcut: '⌘T', defaultOpen: false },
  { id: 'components', name: 'Components', icon: Component, count: 156, shortcut: '⌘C', defaultOpen: false },
  { id: 'blocks', name: 'Blocks', icon: Blocks, count: 89, shortcut: '⌘B', defaultOpen: false },
  { id: 'saved', name: 'Saved Sections', icon: Bookmark, count: 7, shortcut: '⌘⇧S', defaultOpen: false },
  { id: 'ai-generated', name: 'AI Generated', icon: Sparkles, count: 3, shortcut: '⌘⇧A', defaultOpen: false },
  { id: 'assets', name: 'Assets', icon: Folder, count: 234, shortcut: '⌘A', defaultOpen: false },
  { id: 'global', name: 'Global Components', icon: Package, count: 15, shortcut: '⌘G', defaultOpen: false },
  { id: 'theme', name: 'Theme', icon: Palette, count: 1, shortcut: '⌘⇧T', defaultOpen: false },
  { id: 'seo', name: 'SEO', icon: Globe, count: 1, shortcut: '⌘⇧E', defaultOpen: false },
  { id: 'navigation', name: 'Navigation', icon: NavIcon, count: 3, shortcut: '⌘N', defaultOpen: false },
  { id: 'footer', name: 'Footer', icon: Footprints, count: 2, shortcut: '⌘⇧F', defaultOpen: false },
  { id: 'analytics', name: 'Analytics', icon: TrendingUp, count: 1, shortcut: '⌘⇧A', defaultOpen: false },
  { id: 'history', name: 'History', icon: History, count: 45, shortcut: '⌘H', defaultOpen: false },
];

export function LeftSidebar({
  sections,
  selectedSection,
  onSelectSection,
  onAddSection,
  onRemoveSection,
  onDuplicateSection,
  onReorderSections
}: LeftSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sections: true,
  });
  const [showAddSection, setShowAddSection] = useState(false);

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-[280px] border-r border-border/40 bg-background/50 backdrop-blur-sm flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sections..."
            className="pl-10 h-9 bg-muted/50 border-border/40"
          />
        </div>
      </div>

      {/* Sidebar Content */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {SIDEBAR_SECTIONS.map((section) => (
            <Collapsible
              key={section.id}
              open={openSections[section.id] || section.defaultOpen}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative">
                    <section.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    {section.id === 'favorites' && <Star className="w-2 h-2 absolute -top-1 -right-1 text-yellow-500 fill-yellow-500" />}
                    {section.id === 'ai-generated' && <Sparkles className="w-2 h-2 absolute -top-1 -right-1 text-brand-500 fill-brand-500" />}
                  </div>
                  <span className="text-sm font-medium group-hover:text-foreground transition-colors">{section.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {section.count && (
                    <Badge variant="outline" className="text-xs h-5 px-1.5 bg-muted/50 border-border/40">
                      {section.count}
                    </Badge>
                  )}
                  {section.shortcut && (
                    <kbd className="hidden lg:flex text-[10px] px-1.5 py-0.5 bg-muted rounded border border-border/40 text-muted-foreground">
                      {section.shortcut}
                    </kbd>
                  )}
                  {openSections[section.id] || section.defaultOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="pl-6 pr-2 py-1">
                {section.id === 'favorites' && (
                  <div className="space-y-1">
                    {['Hero Banner', 'Featured Products', 'Flash Sale', 'Testimonials', 'Newsletter'].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                      >
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm flex-1">{item}</span>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'recent' && (
                  <div className="space-y-1">
                    {['Hero Banner', 'Categories', 'Best Sellers', 'Brands', 'Footer'].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                      >
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm flex-1">{item}</span>
                        <span className="text-xs text-muted-foreground">2m ago</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'sections' && (
                  <div className="space-y-1">
                    {sections.map((sectionItem, index) => (
                      <div
                        key={sectionItem.id}
                        className={`group relative flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                          selectedSection?.id === sectionItem.id
                            ? 'bg-brand-500/10 border border-brand-500/30'
                            : 'hover:bg-muted/50 border border-transparent'
                        }`}
                        onClick={() => onSelectSection(sectionItem)}
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                        <sectionItem.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm flex-1">{sectionItem.name}</span>
                        
                        {/* Visibility Toggle */}
                        <button
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted rounded flex items-center justify-center"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            // Toggle visibility
                          }}
                        >
                          {sectionItem.visible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                        </button>

                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted rounded flex items-center justify-center"
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-3 h-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDuplicateSection(sectionItem.id); }}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}>
                              {sectionItem.locked ? (
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
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onRemoveSection(sectionItem.id); }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Lock Indicator */}
                        {sectionItem.locked && (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'ai-generated' && (
                  <div className="space-y-1">
                    {['Luxury Homepage', 'Hero Banner', 'Product Section'].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                      >
                        <Sparkles className="w-3 h-3 text-brand-500 fill-brand-500" />
                        <span className="text-sm flex-1">{item}</span>
                        <Badge variant="outline" className="text-xs h-5 px-1.5 bg-brand-500/10 border-brand-500/30 text-brand-600">
                          AI
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'assets' && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <Folder className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm flex-1">Images</span>
                      <Badge variant="outline" className="text-xs h-5 px-1.5">156</Badge>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <Folder className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm flex-1">Videos</span>
                      <Badge variant="outline" className="text-xs h-5 px-1.5">23</Badge>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <Folder className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm flex-1">Icons</span>
                      <Badge variant="outline" className="text-xs h-5 px-1.5">55</Badge>
                    </div>
                  </div>
                )}

                {section.id === 'global' && (
                  <div className="space-y-1">
                    {['Header', 'Navigation', 'Footer', 'Cookie Banner', 'Announcement Bar'].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                      >
                        <Package className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm flex-1">{item}</span>
                        <Badge variant="outline" className="text-xs h-5 px-1.5 bg-blue-500/10 border-blue-500/30 text-blue-600">
                          Global
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'theme' && (
                  <div className="space-y-1">
                    {['Colors', 'Typography', 'Spacing', 'Shadows', 'Borders', 'Animations'].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Palette className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm flex-1">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'seo' && (
                  <div className="space-y-1">
                    {['Meta Tags', 'Open Graph', 'Twitter Cards', 'Structured Data', 'Sitemap', 'Robots.txt'].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Globe className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm flex-1">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'navigation' && (
                  <div className="space-y-1">
                    {['Main Menu', 'Mobile Menu', 'Footer Menu', 'Breadcrumb'].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <NavIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm flex-1">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'footer' && (
                  <div className="space-y-1">
                    {['Main Footer', 'Mobile Footer', 'Sticky Footer'].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Footprints className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm flex-1">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'analytics' && (
                  <div className="space-y-1">
                    {['Performance', 'SEO Score', 'Accessibility', 'Best Practices', 'Core Web Vitals'].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <TrendingUp className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm flex-1">{item}</span>
                        <Badge variant="outline" className="text-xs h-5 px-1.5 bg-green-500/10 border-green-500/30 text-green-600">
                          95
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'history' && (
                  <div className="space-y-1">
                    {['Current Version', 'Version 2.1', 'Version 2.0', 'Version 1.9'].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                      >
                        <History className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm flex-1">{item}</span>
                        <span className="text-xs text-muted-foreground">{index === 0 ? 'Now' : `${index}h ago`}</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'templates' && (
                  <div className="grid grid-cols-2 gap-2">
                    {['Marketplace', 'Fashion', 'Luxury', 'Beauty'].map((template) => (
                      <div
                        key={template}
                        className="p-3 rounded-lg border border-border/40 hover:border-brand-500/50 cursor-pointer transition-colors"
                      >
                        <div className="aspect-video bg-muted/50 rounded mb-2 flex items-center justify-center">
                          <Layout className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-medium">{template}</p>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'components' && (
                  <div className="space-y-1">
                    {SECTION_TYPES.map((type) => (
                      <div
                        key={type.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => onAddSection(type.id)}
                      >
                        <type.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{type.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>

      {/* Add Section Button */}
      <div className="p-4 border-t border-border/40">
        <Button
          variant="primary"
          onClick={() => setShowAddSection(true)}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </Button>
      </div>
    </motion.aside>
  );
}
