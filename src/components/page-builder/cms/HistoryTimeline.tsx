'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History,
  RotateCcw,
  GitBranch,
  GitMerge,
  MessageSquare,
  User,
  Clock,
  Check,
  X,
  Eye,
  Trash2,
  Copy,
  Download,
  Upload,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HistoryEntry {
  id: string;
  timestamp: Date;
  author: string;
  authorAvatar?: string;
  action: string;
  description: string;
  changes: {
    type: 'add' | 'modify' | 'delete';
    target: string;
    details: string;
  }[];
  comment?: string;
  branch?: string;
  version: string;
}

interface HistoryTimelineProps {
  history: HistoryEntry[];
  currentVersion: string;
  onRestore?: (version: string) => void;
  onCompare?: (version1: string, version2: string) => void;
  onCreateBranch?: (name: string) => void;
  onMergeBranch?: (branch: string) => void;
  onAddComment?: (version: string, comment: string) => void;
}

export function HistoryTimeline({
  history,
  currentVersion,
  onRestore,
  onCompare,
  onCreateBranch,
  onMergeBranch,
  onAddComment
}: HistoryTimelineProps) {
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersion1, setCompareVersion1] = useState<string>('');
  const [compareVersion2, setCompareVersion2] = useState<string>('');
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const toggleExpand = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Check className="w-4 h-4 text-green-500" />;
      case 'modified': return <RotateCcw className="w-4 h-4 text-blue-500" />;
      case 'deleted': return <X className="w-4 h-4 text-red-500" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'add': return <Check className="w-3 h-3 text-green-500" />;
      case 'modify': return <RotateCcw className="w-3 h-3 text-blue-500" />;
      case 'delete': return <X className="w-3 h-3 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h3 className="font-semibold">History Timeline</h3>
            <Badge variant="outline" className="text-xs">
              {history.length} versions
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCompareMode(!compareMode)}
              className={compareMode ? 'bg-brand-500/10 text-brand-600' : ''}
            >
              <Eye className="w-4 h-4 mr-1" />
              Compare
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowBranchDialog(true)}>
              <GitBranch className="w-4 h-4 mr-1" />
              Branch
            </Button>
          </div>
        </div>

        {compareMode && (
          <div className="flex gap-2 p-3 rounded-lg bg-muted/50">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Version 1</Label>
              <Select value={compareVersion1} onValueChange={setCompareVersion1}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {history.map((entry) => (
                    <SelectItem key={entry.id} value={entry.version}>
                      {entry.version} - {formatTimestamp(entry.timestamp)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Version 2</Label>
              <Select value={compareVersion2} onValueChange={setCompareVersion2}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {history.map((entry) => (
                    <SelectItem key={entry.id} value={entry.version}>
                      {entry.version} - {formatTimestamp(entry.timestamp)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              className="self-end"
              disabled={!compareVersion1 || !compareVersion2}
              onClick={() => onCompare?.(compareVersion1, compareVersion2)}
            >
              Compare
            </Button>
          </div>
        )}
      </div>

      {/* Branch Dialog */}
      <AnimatePresence>
        {showBranchDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/95 z-50 p-4 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Create New Branch</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowBranchDialog(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Branch Name</Label>
                <Input
                  value={newBranchName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBranchName(e.target.value)}
                  placeholder="feature/new-design"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    onCreateBranch?.(newBranchName);
                    setShowBranchDialog(false);
                    setNewBranchName('');
                  }}
                  disabled={!newBranchName}
                >
                  Create Branch
                </Button>
                <Button variant="outline" onClick={() => setShowBranchDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {history.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              {/* Timeline Line */}
              {index < history.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-full bg-border/40" />
              )}

              {/* Entry */}
              <div className="flex gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  {getActionIcon(entry.action)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div
                    className="p-3 rounded-lg border border-border/40 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all cursor-pointer"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{entry.action}</span>
                        <Badge variant="outline" className="text-xs">
                          {entry.version}
                        </Badge>
                        {entry.version === currentVersion && (
                          <Badge variant="default" className="text-xs bg-brand-500">
                            Current
                          </Badge>
                        )}
                        {entry.branch && (
                          <Badge variant="secondary" className="text-xs">
                            <GitBranch className="w-3 h-3 mr-1" />
                            {entry.branch}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(entry.timestamp)}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {entry.author}
                      </div>
                      {entry.comment && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="w-3 h-3" />
                          Has comment
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(entry.id);
                      }}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {expandedEntries.has(entry.id) ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                      {expandedEntries.has(entry.id) ? 'Hide details' : 'Show details'}
                    </button>

                    <AnimatePresence>
                      {expandedEntries.has(entry.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-3 pt-3 border-t border-border/40"
                        >
                          {/* Changes */}
                          <div className="space-y-2 mb-3">
                            <Label className="text-xs">Changes</Label>
                            {entry.changes.map((change, idx) => (
                              <div key={idx} className="flex items-start gap-2 p-2 rounded bg-muted/50">
                                {getChangeIcon(change.type)}
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium capitalize">{change.type}</div>
                                  <div className="text-xs text-muted-foreground">{change.target}</div>
                                  <div className="text-xs text-muted-foreground">{change.details}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Comment */}
                          {entry.comment && (
                            <div className="space-y-2 mb-3">
                              <Label className="text-xs">Comment</Label>
                              <div className="p-2 rounded bg-muted/50 text-sm">
                                {entry.comment}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            {entry.version !== currentVersion && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRestore?.(entry.version);
                                }}
                              >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Restore
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCompareVersion1(entry.version);
                                setCompareMode(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Compare
                            </Button>
                            {entry.branch && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMergeBranch?.(entry.branch!);
                                }}
                              >
                                <GitMerge className="w-4 h-4 mr-1" />
                                Merge
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/40 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Version {selectedEntry.version}</h4>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Add Comment</Label>
              <Textarea
                placeholder="Add a comment to this version..."
                rows={2}
                className="resize-none"
              />
              <Button size="sm" onClick={() => onAddComment?.(selectedEntry.version, '')}>
                <MessageSquare className="w-4 h-4 mr-1" />
                Add Comment
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Copy className="w-4 h-4 mr-1" />
                Duplicate
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
