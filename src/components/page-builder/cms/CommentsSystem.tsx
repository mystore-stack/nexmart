'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare,
  X,
  Send,
  AtSign,
  Check,
  Trash2,
  Edit2,
  Reply,
  MoreVertical,
  Pin,
  Unpin,
  Clock,
  User
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  position: { x: number; y: number };
  timestamp: Date;
  resolved: boolean;
  pinned: boolean;
  mentions: string[];
  replies: Comment[];
}

interface CommentsSystemProps {
  comments: Comment[];
  currentUser: string;
  currentUserAvatar?: string;
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onUpdateComment: (id: string, content: string) => void;
  onDeleteComment: (id: string) => void;
  onResolveComment: (id: string) => void;
  onPinComment: (id: string) => void;
  onReplyToComment: (parentId: string, reply: Omit<Comment, 'id' | 'timestamp'>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentsSystem({
  comments,
  currentUser,
  currentUserAvatar,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onResolveComment,
  onPinComment,
  onReplyToComment,
  isOpen,
  onClose
}: CommentsSystemProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

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

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    onAddComment({
      author: currentUser,
      authorAvatar: currentUserAvatar,
      content: newComment,
      position: { x: 0, y: 0 }, // Would be set from click position
      resolved: false,
      pinned: false,
      mentions: [],
      replies: []
    });
    
    setNewComment('');
  };

  const handleReply = () => {
    if (!replyText.trim() || !replyingTo) return;
    
    onReplyToComment(replyingTo, {
      author: currentUser,
      authorAvatar: currentUserAvatar,
      content: replyText,
      position: { x: 0, y: 0 },
      resolved: false,
      pinned: false,
      mentions: [],
      replies: []
    });
    
    setReplyText('');
    setReplyingTo(null);
  };

  const handleEdit = () => {
    if (!editText.trim() || !editingId) return;
    onUpdateComment(editingId, editText);
    setEditingId(null);
    setEditText('');
  };

  const unresolvedComments = comments.filter(c => !c.resolved);
  const resolvedComments = comments.filter(c => c.resolved);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 bottom-0 w-96 bg-background border-l border-border/40 shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-semibold">Comments</h3>
                <Badge variant="outline" className="text-xs">
                  {unresolvedComments.length} unresolved
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* New Comment Input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentUserAvatar} />
                  <AvatarFallback>{currentUser.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Leave a comment... Use @ to mention teammates"
                    value={newComment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                    rows={2}
                    className="resize-none text-sm"
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      Press Enter to send
                    </div>
                    <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="w-4 h-4 mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Pinned Comments */}
              {comments.filter(c => c.pinned).length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Pin className="w-3 h-3" />
                    Pinned
                  </div>
                  {comments.filter(c => c.pinned).map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      currentUser={currentUser}
                      onResolve={onResolveComment}
                      onPin={onPinComment}
                      onDelete={onDeleteComment}
                      onEdit={(id, content) => {
                        setEditingId(id);
                        setEditText(content);
                      }}
                      onReply={(id) => setReplyingTo(id)}
                      isEditing={editingId === comment.id}
                      editText={editText}
                      onEditChange={setEditText}
                      onEditSave={handleEdit}
                      onEditCancel={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                      isReplying={replyingTo === comment.id}
                      replyText={replyText}
                      onReplyChange={setReplyText}
                      onReplySave={handleReply}
                      onReplyCancel={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Unresolved Comments */}
              {unresolvedComments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <MessageSquare className="w-3 h-3" />
                    Unresolved
                  </div>
                  {unresolvedComments.filter(c => !c.pinned).map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      currentUser={currentUser}
                      onResolve={onResolveComment}
                      onPin={onPinComment}
                      onDelete={onDeleteComment}
                      onEdit={(id, content) => {
                        setEditingId(id);
                        setEditText(content);
                      }}
                      onReply={(id) => setReplyingTo(id)}
                      isEditing={editingId === comment.id}
                      editText={editText}
                      onEditChange={setEditText}
                      onEditSave={handleEdit}
                      onEditCancel={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                      isReplying={replyingTo === comment.id}
                      replyText={replyText}
                      onReplyChange={setReplyText}
                      onReplySave={handleReply}
                      onReplyCancel={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Resolved Comments */}
              {resolvedComments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Check className="w-3 h-3" />
                    Resolved
                  </div>
                  {resolvedComments.filter(c => !c.pinned).map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      currentUser={currentUser}
                      onResolve={onResolveComment}
                      onPin={onPinComment}
                      onDelete={onDeleteComment}
                      onEdit={(id, content) => {
                        setEditingId(id);
                        setEditText(content);
                      }}
                      onReply={(id) => setReplyingTo(id)}
                      isEditing={editingId === comment.id}
                      editText={editText}
                      onEditChange={setEditText}
                      onEditSave={handleEdit}
                      onEditCancel={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                      isReplying={replyingTo === comment.id}
                      replyText={replyText}
                      onReplyChange={setReplyText}
                      onReplySave={handleReply}
                      onReplyCancel={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                    />
                  ))}
                </div>
              )}

              {comments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No comments yet</p>
                  <p className="text-xs">Click anywhere on the canvas to add a comment</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface CommentCardProps {
  comment: Comment;
  currentUser: string;
  onResolve: (id: string) => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onReply: (id: string) => void;
  isEditing: boolean;
  editText: string;
  onEditChange: (text: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  isReplying: boolean;
  replyText: string;
  onReplyChange: (text: string) => void;
  onReplySave: () => void;
  onReplyCancel: () => void;
}

function CommentCard({
  comment,
  currentUser,
  onResolve,
  onPin,
  onDelete,
  onEdit,
  onReply,
  isEditing,
  editText,
  onEditChange,
  onEditSave,
  onEditCancel,
  isReplying,
  replyText,
  onReplyChange,
  onReplySave,
  onReplyCancel
}: CommentCardProps) {
  const isOwnComment = comment.author === currentUser;

  return (
    <div className={`p-3 rounded-lg border ${comment.resolved ? 'bg-muted/30 border-border/40 opacity-60' : 'bg-background border-border/60'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={comment.authorAvatar} />
            <AvatarFallback className="text-xs">{comment.author.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">{comment.author}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimestamp(comment.timestamp)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {comment.pinned && <Pin className="w-3 h-3 text-brand-500" />}
          {comment.resolved && <Check className="w-3 h-3 text-green-500" />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwnComment && (
                <DropdownMenuItem onClick={() => onEdit(comment.id, comment.content)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onReply(comment.id)}>
                <Reply className="w-4 h-4 mr-2" />
                Reply
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPin(comment.id)}>
                {comment.pinned ? (
                  <>
                    <Unpin className="w-4 h-4 mr-2" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="w-4 h-4 mr-2" />
                    Pin
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResolve(comment.id)}>
                {comment.resolved ? (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Reopen
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Resolve
                  </>
                )}
              </DropdownMenuItem>
              {isOwnComment && (
                <DropdownMenuItem onClick={() => onDelete(comment.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-2 mb-2">
          <Textarea
            value={editText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onEditChange(e.target.value)}
            rows={2}
            className="resize-none text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onEditSave}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onEditCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm mb-2">{comment.content}</p>
      )}

      {/* Mentions */}
      {comment.mentions.length > 0 && (
        <div className="flex gap-1 mb-2 flex-wrap">
          {comment.mentions.map((mention) => (
            <Badge key={mention} variant="secondary" className="text-xs">
              <AtSign className="w-3 h-3 mr-1" />
              {mention}
            </Badge>
          ))}
        </div>
      )}

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="space-y-2 mt-3 pt-3 border-t border-border/40">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-2 pl-3">
              <Avatar className="w-5 h-5">
                <AvatarImage src={reply.authorAvatar} />
                <AvatarFallback className="text-xs">{reply.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">{reply.author}</span>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(reply.timestamp)}</span>
                </div>
                <p className="text-xs">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Input */}
      {isReplying && (
        <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
          <div className="flex gap-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onReplyChange(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={onReplySave}>
              <Send className="w-4 h-4 mr-1" />
              Reply
            </Button>
            <Button size="sm" variant="outline" onClick={onReplyCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimestamp(date: Date) {
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
}
