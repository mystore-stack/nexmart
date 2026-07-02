'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket,
  X,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Bell,
  Webhook,
  GitBranch,
  RotateCcw,
  Eye,
  Send,
  Loader2,
  MoreVertical,
  History,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PublishWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish?: (options: PublishOptions) => void;
}

interface PublishOptions {
  status: 'draft' | 'review' | 'approved' | 'scheduled' | 'published';
  scheduledDate?: Date;
  notes?: string;
  notifyTeam?: boolean;
  slackIntegration?: boolean;
  webhookUrl?: string;
}

export function PublishWorkflow({ isOpen, onClose, onPublish }: PublishWorkflowProps) {
  const [status, setStatus] = useState<'draft' | 'review' | 'approved' | 'scheduled' | 'published'>('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');
  const [notifyTeam, setNotifyTeam] = useState(true);
  const [slackIntegration, setSlackIntegration] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState('workflow');

  const workflowSteps = [
    { id: 'draft', label: 'Draft', icon: <FileText className="w-4 h-4" />, description: 'Work in progress' },
    { id: 'review', label: 'Review', icon: <Eye className="w-4 h-4" />, description: 'Awaiting review' },
    { id: 'approved', label: 'Approved', icon: <CheckCircle className="w-4 h-4" />, description: 'Ready to publish' },
    { id: 'scheduled', label: 'Scheduled', icon: <Calendar className="w-4 h-4" />, description: 'Scheduled for later' },
    { id: 'published', label: 'Published', icon: <Rocket className="w-4 h-4" />, description: 'Live' },
  ];

  const recentVersions = [
    { id: '1', version: 'v2.3.1', status: 'published', date: '2024-01-15', author: 'John Doe' },
    { id: '2', version: 'v2.3.0', status: 'published', date: '2024-01-10', author: 'Jane Smith' },
    { id: '3', version: 'v2.2.9', status: 'published', date: '2024-01-05', author: 'John Doe' },
    { id: '4', version: 'v2.2.8', status: 'rolled-back', date: '2024-01-02', author: 'Jane Smith' },
  ];

  const teamMembers = [
    { id: '1', name: 'John Doe', role: 'Developer', avatar: 'JD' },
    { id: '2', name: 'Jane Smith', role: 'Designer', avatar: 'JS' },
    { id: '3', name: 'Mike Johnson', role: 'Product Manager', avatar: 'MJ' },
  ];

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      onPublish?.({
        status,
        scheduledDate: status === 'scheduled' ? new Date(`${scheduledDate}T${scheduledTime}`) : undefined,
        notes,
        notifyTeam,
        slackIntegration,
        webhookUrl
      });
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'review': return 'bg-blue-500';
      case 'approved': return 'bg-green-500';
      case 'scheduled': return 'bg-purple-500';
      case 'published': return 'bg-brand-500';
      case 'rolled-back': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            <div className="flex items-center justify-between p-6 border-b border-border/40 bg-gradient-to-r from-brand-500/5 to-brand-600/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Publish Workflow</h3>
                  <p className="text-sm text-muted-foreground">Manage deployment and releases</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-3 w-64 mx-auto mt-4">
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Workflow Tab */}
              <TabsContent value="workflow" className="flex-1 mt-4 p-6">
                <div className="space-y-6">
                  {/* Workflow Steps */}
                  <div>
                    <Label className="text-sm font-medium mb-4 block">Publication Status</Label>
                    <div className="flex items-center justify-between">
                      {workflowSteps.map((step, index) => (
                        <div key={step.id} className="flex-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                status === step.id ? getStatusColor(status) + ' text-white' : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {step.icon}
                            </div>
                            {index < workflowSteps.length - 1 && (
                              <div className={`flex-1 h-0.5 ${status === step.id || workflowSteps.findIndex(s => s.id === status) > index ? getStatusColor(status) : 'bg-border/40'}`} />
                            )}
                          </div>
                          <div className="mt-2 text-center">
                            <div className="text-xs font-medium">{step.label}</div>
                            <div className="text-[10px] text-muted-foreground">{step.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Set Status</Label>
                    <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {workflowSteps.map((step) => (
                          <SelectItem key={step.id} value={step.id}>
                            <div className="flex items-center gap-2">
                              {step.icon}
                              {step.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Scheduled Date */}
                  {status === 'scheduled' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Date</Label>
                        <Input
                          type="date"
                          value={scheduledDate}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduledDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Time</Label>
                        <Input
                          type="time"
                          value={scheduledTime}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduledTime(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Publish Notes */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Publish Notes</Label>
                    <Textarea
                      placeholder="Describe the changes in this release..."
                      value={notes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Notifications */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Notify Team</Label>
                      </div>
                      <Switch checked={notifyTeam} onCheckedChange={setNotifyTeam} />
                    </div>

                    {notifyTeam && (
                      <div className="pl-6 space-y-2">
                        <Label className="text-xs text-muted-foreground">Team Members</Label>
                        <div className="flex gap-2 flex-wrap">
                          {teamMembers.map((member) => (
                            <Badge key={member.id} variant="outline" className="gap-1">
                              <div className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center text-[10px] text-white">
                                {member.avatar}
                              </div>
                              {member.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Slack Integration</Label>
                      </div>
                      <Switch checked={slackIntegration} onCheckedChange={setSlackIntegration} />
                    </div>

                    {slackIntegration && (
                      <div className="pl-6 space-y-2">
                        <Label className="text-xs text-muted-foreground">Slack Webhook URL</Label>
                        <Input
                          placeholder="https://hooks.slack.com/services/..."
                          value={webhookUrl}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWebhookUrl(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-border/40">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePublish}
                      disabled={isPublishing || (status === 'scheduled' && (!scheduledDate || !scheduledTime))}
                      className="flex-1"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
                          {status === 'published' ? 'Publish Now' : status === 'scheduled' ? 'Schedule' : `Set to ${status}`}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="flex-1 mt-4 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Version History</Label>
                    <Button variant="outline" size="sm">
                      <GitBranch className="w-4 h-4 mr-1" />
                      Compare
                    </Button>
                  </div>

                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {recentVersions.map((version) => (
                        <div key={version.id} className="p-4 rounded-lg border border-border/40 hover:border-brand-500/50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(version.status)} text-white`}>
                                <History className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium">{version.version}</div>
                                <div className="text-xs text-muted-foreground">{version.author} • {version.date}</div>
                              </div>
                            </div>
                            <Badge variant="outline" className={status === 'rolled-back' ? 'border-red-500 text-red-500' : ''}>
                              {version.status}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Rollback
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <FileText className="w-4 h-4 mr-2" />
                                  View Notes
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <GitBranch className="w-4 h-4 mr-2" />
                                  Compare with Current
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="flex-1 mt-4 p-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Webhook className="w-5 h-5" />
                      <h4 className="font-medium">Webhook Settings</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Default Webhook URL</Label>
                      <Input
                        placeholder="https://your-webhook-url.com"
                        value={webhookUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWebhookUrl(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Webhook Events</Label>
                      <div className="space-y-2">
                        {['on_publish', 'on_rollback', 'on_scheduled', 'on_approval'].map((event) => (
                          <div key={event} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                            <span className="text-sm capitalize">{event.replace('_', ' ')}</span>
                            <Switch defaultChecked={event === 'on_publish'} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Bell className="w-5 h-5" />
                      <h4 className="font-medium">Notification Settings</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                        <div>
                          <div className="text-sm font-medium">Email Notifications</div>
                          <div className="text-xs text-muted-foreground">Receive email on publish events</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                        <div>
                          <div className="text-sm font-medium">Slack Notifications</div>
                          <div className="text-xs text-muted-foreground">Send updates to Slack channel</div>
                        </div>
                        <Switch defaultChecked={slackIntegration} />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                        <div>
                          <div className="text-sm font-medium">Browser Notifications</div>
                          <div className="text-xs text-muted-foreground">Show desktop notifications</div>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5" />
                      <h4 className="font-medium">Approval Workflow</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Required Approvers</Label>
                      <div className="flex gap-2 flex-wrap">
                        {teamMembers.map((member) => (
                          <Badge key={member.id} variant="outline" className="gap-1 cursor-pointer hover:bg-brand-500/10">
                            <div className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center text-[10px] text-white">
                              {member.avatar}
                            </div>
                            {member.name}
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          </Badge>
                        ))}
                        <Button variant="outline" size="sm" className="h-7">
                          <Users className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
