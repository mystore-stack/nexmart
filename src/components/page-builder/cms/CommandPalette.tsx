'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  Layout,
  Layers,
  Square,
  Image as ImageIcon,
  Palette,
  Settings,
  Globe,
  BarChart3,
  History,
  Save,
  Send,
  Undo2,
  Redo2,
  Eye,
  Smartphone,
  Command
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  onClose: () => void;
  onSelect: (action: string) => void;
}

const COMMANDS = [
  {
    category: 'Sections',
    items: [
      { icon: Layout, label: 'Add Hero Banner', action: 'add-hero' },
      { icon: Layers, label: 'Add Features Section', action: 'add-features' },
      { icon: Square, label: 'Add Featured Products', action: 'add-products' },
      { icon: ImageIcon, label: 'Add Categories', action: 'add-categories' },
      { icon: Layout, label: 'Add Flash Sale', action: 'add-flash-sale' },
      { icon: Square, label: 'Add Testimonials', action: 'add-testimonials' },
    ]
  },
  {
    category: 'Actions',
    items: [
      { icon: Save, label: 'Save Draft', action: 'save-draft' },
      { icon: Send, label: 'Publish', action: 'publish' },
      { icon: Eye, label: 'Preview', action: 'preview' },
      { icon: Undo2, label: 'Undo', action: 'undo' },
      { icon: Redo2, label: 'Redo', action: 'redo' },
    ]
  },
  {
    category: 'Settings',
    items: [
      { icon: Palette, label: 'Theme Settings', action: 'theme-settings' },
      { icon: Globe, label: 'SEO Settings', action: 'seo-settings' },
      { icon: Smartphone, label: 'Device Preview', action: 'device-preview' },
      { icon: BarChart3, label: 'Analytics', action: 'analytics' },
      { icon: History, label: 'Version History', action: 'history' },
    ]
  },
];

export function CommandPalette({ onClose, onSelect }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = COMMANDS.flatMap(category => 
    category.items.filter(item => 
      item.label.toLowerCase().includes(search.toLowerCase())
    )
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      }
      if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        onSelect(filteredCommands[selectedIndex].action);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onClose, onSelect]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -10 }}
        className="w-full max-w-2xl bg-background rounded-2xl shadow-luxury-lg border border-border/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-border/40">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 border-0 focus-visible:ring-0 text-base"
            autoFocus
          />
          <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border/40">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <ScrollArea className="max-h-[400px]">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No commands found</p>
            </div>
          ) : (
            <div className="p-2">
              {COMMANDS.map((category, categoryIndex) => {
                const categoryItems = category.items.filter(item =>
                  item.label.toLowerCase().includes(search.toLowerCase())
                );
                
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category.category}>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                      {category.category}
                    </div>
                    {categoryItems.map((item, itemIndex) => {
                      const globalIndex = COMMANDS
                        .slice(0, categoryIndex)
                        .reduce((acc, cat) => acc + cat.items.filter(i => 
                          i.label.toLowerCase().includes(search.toLowerCase())
                        ).length, 0) + itemIndex;

                      return (
                        <button
                          key={item.action}
                          onClick={() => onSelect(item.action)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                            selectedIndex === globalIndex
                              ? 'bg-brand-500/10 text-brand-600'
                              : 'hover:bg-muted/50'
                          )}
                        >
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="flex-1">{item.label}</span>
                          {selectedIndex === globalIndex && (
                            <kbd className="px-2 py-0.5 text-xs bg-muted rounded border border-border/40">
                              ↵
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-border/40 bg-muted/30">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border/40">
                <Command className="w-3 h-3" />
              </kbd>
              <span>K</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border/40">↑↓</kbd>
              <span>to navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border/40">↵</kbd>
              <span>to select</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
