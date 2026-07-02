'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Square,
  Layout,
  ShoppingBag,
  Package,
  Image,
  Share2,
  FileText,
  MessageSquare,
  Menu,
  MousePointer2,
  Sparkles,
  BarChart3,
  Star,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Heart,
  Clock
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Component {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  preview: string;
  tags: string[];
  isPremium?: boolean;
  isNew?: boolean;
}

const COMPONENTS: Component[] = [
  // Basic
  { id: 'container', name: 'Container', description: 'Responsive container with max-width', category: 'Basic', icon: <Layout className="w-5 h-5" />, preview: 'container', tags: ['layout', 'responsive'] },
  { id: 'section', name: 'Section', description: 'Full-width section with padding', category: 'Basic', icon: <Square className="w-5 h-5" />, preview: 'section', tags: ['layout', 'spacing'] },
  { id: 'grid', name: 'Grid', description: 'CSS Grid layout component', category: 'Basic', icon: <Layout className="w-5 h-5" />, preview: 'grid', tags: ['layout', 'grid'] },
  { id: 'flex', name: 'Flex', description: 'Flexbox layout component', category: 'Basic', icon: <Layout className="w-5 h-5" />, preview: 'flex', tags: ['layout', 'flex'] },
  
  // Marketing
  { id: 'hero', name: 'Hero Banner', description: 'Large hero section with CTA', category: 'Marketing', icon: <Layout className="w-5 h-5" />, preview: 'hero', tags: ['hero', 'cta'], isPremium: true },
  { id: 'features', name: 'Features Grid', description: 'Feature cards with icons', category: 'Marketing', icon: <Star className="w-5 h-5" />, preview: 'features', tags: ['features', 'grid'] },
  { id: 'testimonials', name: 'Testimonials', description: 'Customer testimonials carousel', category: 'Marketing', icon: <MessageSquare className="w-5 h-5" />, preview: 'testimonials', tags: ['testimonials', 'carousel'], isPremium: true },
  { id: 'cta-section', name: 'CTA Section', description: 'Call-to-action banner', category: 'Marketing', icon: <Sparkles className="w-5 h-5" />, preview: 'cta', tags: ['cta', 'banner'] },
  
  // Commerce
  { id: 'product-card', name: 'Product Card', description: 'E-commerce product display', category: 'Commerce', icon: <ShoppingBag className="w-5 h-5" />, preview: 'product-card', tags: ['product', 'card'] },
  { id: 'product-grid', name: 'Product Grid', description: 'Grid of product cards', category: 'Commerce', icon: <Package className="w-5 h-5" />, preview: 'product-grid', tags: ['products', 'grid'] },
  { id: 'add-to-cart', name: 'Add to Cart', description: 'Cart button with quantity', category: 'Commerce', icon: <ShoppingBag className="w-5 h-5" />, preview: 'add-to-cart', tags: ['cart', 'button'] },
  { id: 'price-display', name: 'Price Display', description: 'Formatted price with discount', category: 'Commerce', icon: <ShoppingBag className="w-5 h-5" />, preview: 'price', tags: ['price', 'discount'] },
  
  // Products
  { id: 'quick-view', name: 'Quick View', description: 'Product quick view modal', category: 'Products', icon: <Package className="w-5 h-5" />, preview: 'quick-view', tags: ['product', 'modal'], isPremium: true },
  { id: 'wishlist', name: 'Wishlist', description: 'Wishlist heart button', category: 'Products', icon: <Heart className="w-5 h-5" />, preview: 'wishlist', tags: ['wishlist', 'button'] },
  { id: 'compare', name: 'Compare Products', description: 'Product comparison table', category: 'Products', icon: <Package className="w-5 h-5" />, preview: 'compare', tags: ['compare', 'table'], isPremium: true },
  
  // Collections
  { id: 'collection-banner', name: 'Collection Banner', description: 'Collection hero banner', category: 'Collections', icon: <Image className="w-5 h-5" aria-hidden="true" />, preview: 'collection-banner', tags: ['collection', 'banner'] },
  { id: 'collection-grid', name: 'Collection Grid', description: 'Grid of collection cards', category: 'Collections', icon: <Package className="w-5 h-5" aria-hidden="true" />, preview: 'collection-grid', tags: ['collections', 'grid'] },
  
  // Media
  { id: 'image-gallery', name: 'Image Gallery', description: 'Responsive image gallery', category: 'Media', icon: <Image className="w-5 h-5" aria-hidden="true" />, preview: 'gallery', tags: ['gallery', 'images'] },
  { id: 'video-player', name: 'Video Player', description: 'Custom video player', category: 'Media', icon: <Layout className="w-5 h-5" aria-hidden="true" />, preview: 'video', tags: ['video', 'player'], isPremium: true },
  { id: 'lightbox', name: 'Lightbox', description: 'Image lightbox viewer', category: 'Media', icon: <Image className="w-5 h-5" aria-hidden="true" />, preview: 'lightbox', tags: ['lightbox', 'modal'] },
  
  // Social
  { id: 'share-buttons', name: 'Share Buttons', description: 'Social sharing buttons', category: 'Social', icon: <Share2 className="w-5 h-5" />, preview: 'share', tags: ['social', 'share'] },
  { id: 'social-feed', name: 'Social Feed', description: 'Instagram feed widget', category: 'Social', icon: <Share2 className="w-5 h-5" />, preview: 'social-feed', tags: ['social', 'instagram'], isPremium: true },
  { id: 'follow-bar', name: 'Follow Bar', description: 'Social follow buttons', category: 'Social', icon: <Share2 className="w-5 h-5" />, preview: 'follow', tags: ['social', 'follow'] },
  
  // CMS
  { id: 'blog-post', name: 'Blog Post', description: 'Blog post card layout', category: 'CMS', icon: <FileText className="w-5 h-5" />, preview: 'blog-post', tags: ['blog', 'post'] },
  { id: 'blog-grid', name: 'Blog Grid', description: 'Grid of blog posts', category: 'CMS', icon: <FileText className="w-5 h-5" />, preview: 'blog-grid', tags: ['blog', 'grid'] },
  { id: 'article-content', name: 'Article Content', description: 'Rich text article layout', category: 'CMS', icon: <FileText className="w-5 h-5" />, preview: 'article', tags: ['article', 'content'] },
  
  // Forms
  { id: 'contact-form', name: 'Contact Form', description: 'Contact form with validation', category: 'Forms', icon: <MessageSquare className="w-5 h-5" />, preview: 'contact-form', tags: ['form', 'contact'] },
  { id: 'newsletter', name: 'Newsletter', description: 'Email signup form', category: 'Forms', icon: <MessageSquare className="w-5 h-5" />, preview: 'newsletter', tags: ['form', 'newsletter'] },
  { id: 'search-form', name: 'Search Form', description: 'Search input with filters', category: 'Forms', icon: <Search className="w-5 h-5" />, preview: 'search-form', tags: ['form', 'search'] },
  
  // Navigation
  { id: 'navbar', name: 'Navbar', description: 'Responsive navigation bar', category: 'Navigation', icon: <Menu className="w-5 h-5" />, preview: 'navbar', tags: ['nav', 'header'] },
  { id: 'mega-menu', name: 'Mega Menu', description: 'Dropdown mega menu', category: 'Navigation', icon: <Menu className="w-5 h-5" />, preview: 'mega-menu', tags: ['nav', 'dropdown'], isPremium: true },
  { id: 'breadcrumb', name: 'Breadcrumb', description: 'Breadcrumb navigation', category: 'Navigation', icon: <Menu className="w-5 h-5" />, preview: 'breadcrumb', tags: ['nav', 'breadcrumb'] },
  { id: 'footer', name: 'Footer', description: 'Multi-column footer', category: 'Navigation', icon: <Layout className="w-5 h-5" />, preview: 'footer', tags: ['footer', 'layout'] },
  
  // Interactive
  { id: 'accordion', name: 'Accordion', description: 'Collapsible accordion', category: 'Interactive', icon: <ChevronDown className="w-5 h-5" />, preview: 'accordion', tags: ['accordion', 'collapse'] },
  { id: 'tabs', name: 'Tabs', description: 'Tabbed content switcher', category: 'Interactive', icon: <Layout className="w-5 h-5" />, preview: 'tabs', tags: ['tabs', 'switcher'] },
  { id: 'modal', name: 'Modal', description: 'Modal dialog popup', category: 'Interactive', icon: <Layout className="w-5 h-5" />, preview: 'modal', tags: ['modal', 'popup'] },
  { id: 'tooltip', name: 'Tooltip', description: 'Hover tooltip component', category: 'Interactive', icon: <MousePointer2 className="w-5 h-5" />, preview: 'tooltip', tags: ['tooltip', 'hover'] },
  
  // AI
  { id: 'ai-recommendations', name: 'AI Recommendations', description: 'AI-powered product suggestions', category: 'AI', icon: <Sparkles className="w-5 h-5" />, preview: 'ai-recs', tags: ['ai', 'recommendations'], isPremium: true, isNew: true },
  { id: 'ai-search', name: 'AI Search', description: 'Smart search with AI', category: 'AI', icon: <Sparkles className="w-5 h-5" />, preview: 'ai-search', tags: ['ai', 'search'], isPremium: true, isNew: true },
  { id: 'ai-chat', name: 'AI Chat Widget', description: 'AI customer support chat', category: 'AI', icon: <MessageSquare className="w-5 h-5" />, preview: 'ai-chat', tags: ['ai', 'chat'], isPremium: true },
  
  // Charts
  { id: 'bar-chart', name: 'Bar Chart', description: 'Interactive bar chart', category: 'Charts', icon: <BarChart3 className="w-5 h-5" />, preview: 'bar-chart', tags: ['chart', 'bar'] },
  { id: 'line-chart', name: 'Line Chart', description: 'Interactive line chart', category: 'Charts', icon: <BarChart3 className="w-5 h-5" />, preview: 'line-chart', tags: ['chart', 'line'] },
  { id: 'pie-chart', name: 'Pie Chart', description: 'Interactive pie chart', category: 'Charts', icon: <BarChart3 className="w-5 h-5" />, preview: 'pie-chart', tags: ['chart', 'pie'] },
  
  // Analytics
  { id: 'stats-card', name: 'Stats Card', description: 'Analytics stat card', category: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, preview: 'stats-card', tags: ['analytics', 'stats'] },
  { id: 'progress-bar', name: 'Progress Bar', description: 'Animated progress bar', category: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, preview: 'progress', tags: ['progress', 'bar'] },
  
  // Premium Blocks
  { id: 'flash-sale', name: 'Flash Sale', description: 'Countdown flash sale banner', category: 'Premium Blocks', icon: <Sparkles className="w-5 h-5" />, preview: 'flash-sale', tags: ['sale', 'countdown'], isPremium: true },
  { id: 'luxury-banner', name: 'Luxury Banner', description: 'Premium hero banner', category: 'Premium Blocks', icon: <Star className="w-5 h-5" />, preview: 'luxury-banner', tags: ['luxury', 'hero'], isPremium: true },
  { id: 'parallax-section', name: 'Parallax Section', description: 'Parallax scrolling section', category: 'Premium Blocks', icon: <Layout className="w-5 h-5" />, preview: 'parallax', tags: ['parallax', 'scroll'], isPremium: true },
  
  // Campaigns
  { id: 'sponsored-products', name: 'Sponsored Products', description: 'Promoted product showcase', category: 'Campaigns', icon: <ShoppingBag className="w-5 h-5" />, preview: 'sponsored-products', tags: ['sponsored', 'products', 'ads'], isPremium: true },
  { id: 'flash-deals', name: 'Flash Deals', description: 'Limited-time flash deals', category: 'Campaigns', icon: <Clock className="w-5 h-5" />, preview: 'flash-deals', tags: ['flash', 'deals', 'limited'], isPremium: true },
  { id: 'frequently-bought-together', name: 'Frequently Bought Together', description: 'Product bundle recommendations', category: 'Campaigns', icon: <Package className="w-5 h-5" />, preview: 'frequently-bought-together', tags: ['bundle', 'recommendations', 'upsell'], isPremium: true },
  { id: 'buy-more-save-more', name: 'Buy More Save More', description: 'Volume discount campaign', category: 'Campaigns', icon: <ShoppingBag className="w-5 h-5" />, preview: 'buy-more-save-more', tags: ['discount', 'volume', 'campaign'], isPremium: true },
  { id: 'mystery-boxes', name: 'Mystery Boxes', description: 'Surprise product boxes', category: 'Campaigns', icon: <Package className="w-5 h-5" />, preview: 'mystery-boxes', tags: ['mystery', 'surprise', 'gamification'], isPremium: true },
  { id: 'build-your-own-bundle', name: 'Build Your Own Bundle', description: 'Custom product bundler', category: 'Campaigns', icon: <Package className="w-5 h-5" />, preview: 'build-your-own-bundle', tags: ['bundle', 'custom', 'interactive'], isPremium: true },
];

const CATEGORIES = [
  { id: 'all', name: 'All Components', icon: <Package className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.length },
  { id: 'Basic', name: 'Basic', icon: <Square className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'Basic').length },
  { id: 'Marketing', name: 'Marketing', icon: <Layout className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'Marketing').length },
  { id: 'Commerce', name: 'Commerce', icon: <ShoppingBag className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'Commerce').length },
  { id: 'Products', name: 'Products', icon: <Package className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'Products').length },
  { id: 'Collections', name: 'Collections', icon: <Package className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'Collections').length },
  { id: 'Media', name: 'Media', icon: <Image className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'Media').length },
  { id: 'Social', name: 'Social', icon: <Share2 className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'Social').length },
  { id: 'CMS', name: 'CMS', icon: <FileText className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'CMS').length },
  { id: 'Forms', name: 'Forms', icon: <MessageSquare className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'Forms').length },
  { id: 'Navigation', name: 'Navigation', icon: <Menu className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'Navigation').length },
  { id: 'Interactive', name: 'Interactive', icon: <MousePointer2 className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'Interactive').length },
  { id: 'AI', name: 'AI', icon: <Sparkles className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'AI').length },
  { id: 'Charts', name: 'Charts', icon: <BarChart3 className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'Charts').length },
  { id: 'Analytics', name: 'Analytics', icon: <BarChart3 className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'Analytics').length },
  { id: 'Premium Blocks', name: 'Premium Blocks', icon: <Star className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'Premium Blocks').length },
  { id: 'Campaigns', name: 'Campaigns', icon: <ShoppingBag className="w-4 h-4" aria-hidden="true" />, count: COMPONENTS.filter(c => c.category === 'Campaigns').length },
];

interface ComponentLibraryProps {
  onAddComponent?: (component: Component) => void;
}

export function ComponentLibrary({ onAddComponent }: ComponentLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const filteredComponents = COMPONENTS.filter(component => {
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         component.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/40 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Component Library</h3>
          <Badge variant="outline" className="text-xs">
            {COMPONENTS.length} components
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {CATEGORIES.map((category) => (
            <div key={category.id}>
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  {category.icon}
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {category.count}
                </Badge>
              </button>

              <AnimatePresence>
                {expandedCategories.has(category.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-6 pr-2 py-2 space-y-2">
                      {COMPONENTS
                        .filter(c => category.id === 'all' || c.category === category.id)
                        .filter(c => 
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map((component) => (
                        <motion.div
                          key={component.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group relative p-3 rounded-lg border border-border/40 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all cursor-pointer"
                          onClick={() => onAddComponent?.(component)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-brand-500/10 transition-colors">
                              {component.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{component.name}</span>
                                {component.isPremium && (
                                  <Star className="w-3 h-3 text-brand-500 fill-brand-500" />
                                )}
                                {component.isNew && (
                                  <Badge variant="outline" className="text-[10px] h-4 px-1">New</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {component.description}
                              </p>
                              <div className="flex items-center gap-1 mt-2 flex-wrap">
                                {component.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1.5">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <button className="h-7 w-7 rounded-lg bg-muted/50 hover:bg-brand-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
