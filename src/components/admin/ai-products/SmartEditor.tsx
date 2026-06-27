"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Textarea, Badge } from "@/components/ui";
import { 
  Wand2, 
  Sparkles, 
  FileText, 
  Languages, 
  Zap,
  RefreshCw,
  CheckCircle,
  Copy,
  Undo
} from "lucide-react";

interface SmartEditorProps {
  content: string;
  contentType: "title" | "description" | "features" | "specifications";
  onContentChange: (content: string) => void;
  disabled?: boolean;
}

type AIAction = 
  | "improve"
  | "rewrite"
  | "shorten"
  | "expand"
  | "professional"
  | "luxury"
  | "friendly"
  | "seo_optimized"
  | "translate";

const AI_ACTIONS: Array<{
  id: AIAction;
  label: string;
  icon: any;
  description: string;
  color: string;
}> = [
  {
    id: "improve",
    label: "Improve",
    icon: Sparkles,
    description: "Enhance quality and clarity",
    color: "text-purple-600 bg-purple-50",
  },
  {
    id: "rewrite",
    label: "Rewrite",
    icon: RefreshCw,
    description: "Create fresh variation",
    color: "text-blue-600 bg-blue-50",
  },
  {
    id: "shorten",
    label: "Shorten",
    icon: FileText,
    description: "Make more concise",
    color: "text-green-600 bg-green-50",
  },
  {
    id: "expand",
    label: "Expand",
    icon: FileText,
    description: "Add more detail",
    color: "text-amber-600 bg-amber-50",
  },
  {
    id: "professional",
    label: "Professional",
    icon: Wand2,
    description: "Business-focused tone",
    color: "text-slate-600 bg-slate-50",
  },
  {
    id: "luxury",
    label: "Luxury",
    icon: Sparkles,
    description: "Premium, elegant tone",
    color: "text-amber-600 bg-amber-50",
  },
  {
    id: "friendly",
    label: "Friendly",
    icon: Sparkles,
    description: "Warm, approachable tone",
    color: "text-pink-600 bg-pink-50",
  },
  {
    id: "seo_optimized",
    label: "SEO Optimized",
    icon: Zap,
    description: "Search engine friendly",
    color: "text-cyan-600 bg-cyan-50",
  },
  {
    id: "translate",
    label: "Translate",
    icon: Languages,
    description: "Convert to another language",
    color: "text-indigo-600 bg-indigo-50",
  },
];

export function SmartEditor({ 
  content, 
  contentType, 
  onContentChange, 
  disabled = false 
}: SmartEditorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalContent, setOriginalContent] = useState(content);
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleAIAction = async (action: AIAction) => {
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate different AI transformations
    let newContent = content;
    switch (action) {
      case "improve":
        newContent = content + " (Enhanced with AI)";
        break;
      case "rewrite":
        newContent = "Freshly rewritten: " + content;
        break;
      case "shorten":
        newContent = content.split(" ").slice(0, Math.ceil(content.split(" ").length * 0.7)).join(" ");
        break;
      case "expand":
        newContent = content + " " + content;
        break;
      case "professional":
        newContent = "Professional: " + content;
        break;
      case "luxury":
        newContent = "✨ Luxury Edition: " + content;
        break;
      case "friendly":
        newContent = "Hey! " + content;
        break;
      case "seo_optimized":
        newContent = content + " #SEO #Optimized";
        break;
      case "translate":
        newContent = "[Translated] " + content;
        break;
    }
    
    const newHistory = [...history.slice(0, historyIndex + 1), newContent];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onContentChange(newContent);
    setIsProcessing(false);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onContentChange(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onContentChange(history[newIndex]);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
  };

  const handleReset = () => {
    onContentChange(originalContent);
    setHistory([originalContent]);
    setHistoryIndex(0);
  };

  return (
    <div className="space-y-4">
      {/* AI Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wand2 className="h-5 w-5" />
            AI-Powered Editing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {AI_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className={`h-auto flex flex-col items-center gap-1 py-3 ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => !disabled && !isProcessing && handleAIAction(action.id)}
                  disabled={disabled || isProcessing}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline">
              {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex === 0 || disabled}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex === history.length - 1 || disabled}
              >
                <Undo className="h-4 w-4 rotate-180" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={disabled}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={disabled}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            disabled={disabled}
            placeholder={`Enter your ${contentType} here...`}
            className="min-h-[200px] resize-y"
          />
          
          <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
            <span>{content.split(/\s+/).filter(Boolean).length} words</span>
            <span>{content.length} characters</span>
          </div>
        </CardContent>
      </Card>

      {/* Processing Indicator */}
      {isProcessing && (
        <Card className="border-brand-200 bg-brand-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              <div>
                <p className="font-medium text-brand-900">AI is working...</p>
                <p className="text-sm text-brand-700">Enhancing your content</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Indicator */}
      {!isProcessing && content !== originalContent && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-900">Content enhanced</p>
                <p className="text-sm text-green-700">AI has improved your content</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-green-700 border-green-300"
              >
                Undo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
