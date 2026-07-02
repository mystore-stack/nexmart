'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  History,
  FileText,
  Globe,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PublishDialogProps {
  onClose: () => void;
  onPublish: () => void;
}

const VERSIONS = [
  { id: 1, name: 'Current Draft', status: 'draft', date: 'Just now', author: 'You' },
  { id: 2, name: 'Version 2.1', status: 'published', date: '2 hours ago', author: 'You' },
  { id: 3, name: 'Version 2.0', status: 'published', date: 'Yesterday', author: 'You' },
  { id: 4, name: 'Version 1.9', status: 'archived', date: '3 days ago', author: 'You' },
];

const STATUS_STEPS = [
  { id: 'draft', label: 'Draft', icon: FileText },
  { id: 'review', label: 'Review', icon: Eye },
  { id: 'scheduled', label: 'Scheduled', icon: Calendar },
  { id: 'published', label: 'Published', icon: Globe },
];

export function PublishDialog({ onClose, onPublish }: PublishDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState('published');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [publishNotes, setPublishNotes] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [notifyTeam, setNotifyTeam] = useState(true);

  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPublishing(false);
    onPublish();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'review': return 'bg-blue-500/10 text-blue-600';
      case 'scheduled': return 'bg-orange-500/10 text-orange-600';
      case 'published': return 'bg-green-500/10 text-green-600';
      case 'archived': return 'bg-gray-500/10 text-gray-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl bg-background rounded-2xl shadow-luxury-lg border border-border/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <div>
            <h2 className="text-xl font-semibold">Publish Homepage</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Review and publish your changes
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Status Steps */}
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        selectedStatus === step.id
                          ? 'border-brand-500/50 bg-brand-500/10'
                          : 'border-border/40 bg-muted/30'
                      }`}
                    >
                      <step.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{step.label}</span>
                    </div>
                    {index < STATUS_STEPS.length - 1 && (
                      <div className="w-8 h-px bg-border/40" />
                    )}
                  </div>
                ))}
              </div>

              {/* Publish Notes */}
              <div className="space-y-2">
                <Label>Publish Notes</Label>
                <Textarea
                  value={publishNotes}
                  onChange={(e) => setPublishNotes(e.target.value)}
                  placeholder="Describe the changes you're making..."
                  rows={4}
                />
              </div>

              {/* Notify Team */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-muted/30">
                <div>
                  <Label className="font-medium">Notify Team</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Send notification to team members about this update
                  </p>
                </div>
                <Switch
                  checked={notifyTeam}
                  onCheckedChange={setNotifyTeam}
                />
              </div>

              {/* Summary */}
              <div className="p-4 rounded-lg border border-border/40 bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sections</span>
                  <Badge variant="outline">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Changes</span>
                  <Badge variant="outline">5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Modified</span>
                  <span className="text-sm">Just now</span>
                </div>
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border/40 bg-muted/30">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-brand-600" />
                  <div>
                    <p className="font-medium">Scheduled Publish</p>
                    <p className="text-sm text-muted-foreground">
                      {scheduleDate && scheduleTime
                        ? `Will publish on ${scheduleDate} at ${scheduleTime}`
                        : 'Select a date and time to schedule'}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-6">
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {VERSIONS.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                          <History className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{version.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {version.date} • by {version.author}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(version.status)}>
                        {version.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border/40 bg-muted/30">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing}
            className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 min-w-[120px]"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Publish
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
