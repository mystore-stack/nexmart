'use client';

import { motion } from 'framer-motion';
import { 
  Layout, 
  Search, 
  Sparkles, 
  Eye, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Undo2, 
  Redo2, 
  Save, 
  Send,
  User,
  ChevronRight,
  Command
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

interface TopNavigationProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onToggleAI: () => void;
  onShowCommandPalette: () => void;
  device: 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'small-mobile';
  onDeviceChange: (device: 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'small-mobile') => void;
  isSaving?: boolean;
  isPublishing?: boolean;
  lastSaved?: Date | null;
  status?: string;
}

export function TopNavigation({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSaveDraft,
  onPublish,
  onToggleAI,
  onShowCommandPalette,
  device,
  onDeviceChange,
  isSaving = false,
  isPublishing = false,
  lastSaved,
  status,
}: TopNavigationProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50"
    >
      {/* Left Section - Logo & Breadcrumb */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">NexMart</span>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors">Admin</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-foreground cursor-pointer transition-colors">CMS</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Homepage Builder</span>
        </div>
      </div>

      {/* Center Section - Search & Device Switcher */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sections..."
            className="w-64 pl-10 h-9 bg-muted/50 border-border/40 focus:bg-background transition-colors"
            onClick={onShowCommandPalette}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs bg-muted rounded border border-border/40">
            <Command className="w-3 h-3 inline mr-1" />
            K
          </kbd>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border/40">
          <Button
            variant={device === 'desktop' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onDeviceChange('desktop')}
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button
            variant={device === 'laptop' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onDeviceChange('laptop')}
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button
            variant={device === 'tablet' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onDeviceChange('tablet')}
          >
            <Tablet className="w-4 h-4" />
          </Button>
          <Button
            variant={device === 'mobile' || device === 'small-mobile' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onDeviceChange('mobile')}
          >
            <Smartphone className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border/40 mx-1" />

        {/* AI Assistant */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAI}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">AI Assistant</span>
        </Button>

        {/* Preview */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Preview</span>
        </Button>

        {/* Save Draft */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Draft'}</span>
        </Button>

        {/* Status Badge */}
        {status && (
          <Badge variant={status === 'PUBLISHED' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        )}

        {/* Publish */}
        <Button
          variant="primary"
          size="sm"
          onClick={onPublish}
          disabled={isPublishing}
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">{isPublishing ? 'Publishing...' : 'Publish'}</span>
        </Button>

        <div className="w-px h-6 bg-border/40 mx-1" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-9 p-0 rounded-full"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Help</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
