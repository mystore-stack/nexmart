'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Search,
  Upload,
  X,
  MoreVertical,
  Sparkles,
  Crop,
  Compress,
  Download,
  Share2,
  Trash2,
  Copy,
  Edit2,
  Tag,
  Clock,
  HardDrive,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  size: number;
  createdAt: Date;
  tags: string[];
 folder: string;
  cdnStatus: 'synced' | 'syncing' | 'error';
  versions: number;
}

interface MediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia?: (media: MediaItem) => void;
}

export function MediaManager({ isOpen, onClose, onSelectMedia }: MediaManagerProps) {
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const folders = [
    { id: 'all', name: 'All Media', count: 45 },
    { id: 'images', name: 'Images', count: 32 },
    { id: 'videos', name: 'Videos', count: 8 },
    { id: 'documents', name: 'Documents', count: 5 },
  ];

  const mediaItems: MediaItem[] = [
    {
      id: '1',
      name: 'hero-banner.jpg',
      type: 'image',
      url: '/images/hero-banner.jpg',
      size: 2450000,
      createdAt: new Date('2024-01-15'),
      tags: ['hero', 'banner', 'luxury'],
      folder: 'images',
      cdnStatus: 'synced',
      versions: 3
    },
    {
      id: '2',
      name: 'product-1.jpg',
      type: 'image',
      url: '/images/product-1.jpg',
      size: 1200000,
      createdAt: new Date('2024-01-14'),
      tags: ['product', 'featured'],
      folder: 'images',
      cdnStatus: 'synced',
      versions: 2
    },
    {
      id: '3',
      name: 'promo-video.mp4',
      type: 'video',
      url: '/videos/promo-video.mp4',
      size: 15000000,
      createdAt: new Date('2024-01-13'),
      tags: ['promo', 'video'],
      folder: 'videos',
      cdnStatus: 'syncing',
      versions: 1
    },
    {
      id: '4',
      name: 'category-bg.jpg',
      type: 'image',
      url: '/images/category-bg.jpg',
      size: 890000,
      createdAt: new Date('2024-01-12'),
      tags: ['category', 'background'],
      folder: 'images',
      cdnStatus: 'synced',
      versions: 1
    },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCDNStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'syncing': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const filteredItems = mediaItems.filter(item => {
    const matchesFolder = selectedFolder === 'all' || item.folder === selectedFolder;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 bottom-0 w-[600px] bg-background border-l border-border/40 shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                <h3 className="font-semibold">Media Manager</h3>
                <Badge variant="outline" className="text-xs">
                  {mediaItems.length} files
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setView(view === 'grid' ? 'list' : 'grid')}>
                  {view === 'grid' ? <FileText className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files by name or tags..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Folders */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {folders.map((folder) => (
                <Button
                  key={folder.id}
                  variant={selectedFolder === folder.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFolder(folder.id)}
                  className="flex-shrink-0"
                >
                  {selectedFolder === folder.id ? <FolderOpen className="w-4 h-4 mr-1" /> : <Folder className="w-4 h-4 mr-1" />}
                  {folder.name}
                  <Badge variant="secondary" className="ml-1 text-xs h-4 px-1">
                    {folder.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* AI Tools */}
          <div className="p-4 border-b border-border/40 bg-gradient-to-r from-brand-500/5 to-brand-600/5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-medium">AI Tools</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="text-xs">
                <Crop className="w-3 h-3 mr-1" />
                Background Removal
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Compress className="w-3 h-3 mr-1" />
                Image Upscale
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Crop className="w-3 h-3 mr-1" />
                Smart Crop
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Compress className="w-3 h-3 mr-1" />
                Compress
              </Button>
            </div>
          </div>

          {/* Media Grid */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {view === 'grid' ? (
                <div className="grid grid-cols-2 gap-3">
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`relative group rounded-lg border border-border/40 overflow-hidden cursor-pointer transition-all ${
                        selectedItems.has(item.id) ? 'ring-2 ring-brand-500' : 'hover:border-brand-500/50'
                      }`}
                      onClick={() => {
                        toggleSelection(item.id);
                        onSelectMedia?.(item);
                      }}
                    >
                      {/* Preview */}
                      <div className="aspect-video bg-muted/50 flex items-center justify-center">
                        {item.type === 'image' ? (
                          <div className="w-full h-full bg-gradient-to-br from-brand-500/20 to-brand-600/20 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-brand-500/50" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            {getTypeIcon(item.type)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{item.name}</span>
                          {getCDNStatusIcon(item.cdnStatus)}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatFileSize(item.size)}</span>
                          <span>v{item.versions}</span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {item.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-background/90">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border border-border/40 cursor-pointer transition-all ${
                        selectedItems.has(item.id) ? 'ring-2 ring-brand-500' : 'hover:border-brand-500/50'
                      }`}
                      onClick={() => {
                        toggleSelection(item.id);
                        onSelectMedia?.(item);
                      }}
                    >
                      <div className="p-2 rounded bg-muted/50">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{item.name}</span>
                          {getCDNStatusIcon(item.cdnStatus)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(item.size)}</span>
                          <span>•</span>
                          <span>v{item.versions}</span>
                          <span>•</span>
                          <span>{item.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {item.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select files to manage'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
                {selectedItems.size > 0 && (
                  <Button variant="default" size="sm">
                    Insert {selectedItems.size}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
