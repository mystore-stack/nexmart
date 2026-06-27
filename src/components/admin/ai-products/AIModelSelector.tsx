"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from "@/components/ui";
import { 
  Brain, 
  Zap, 
  Cpu, 
  Sparkles,
  CheckCircle,
  Info
} from "lucide-react";

type AIModel = "GPT_5_5" | "GPT_4_1" | "GPT_4" | "GPT_3_5_TURBO" | "CLAUDE_3_OPUS" | "CLAUDE_3_SONNET" | "CLAUDE_3_HAIKU" | "GEMINI_PRO" | "GEMINI_ULTRA";

interface AIModelConfig {
  id: AIModel;
  name: string;
  provider: string;
  description: string;
  speed: "fast" | "medium" | "slow";
  quality: "standard" | "high" | "premium";
  cost: "low" | "medium" | "high";
  capabilities: string[];
  maxTokens: number;
  icon: any;
}

const AI_MODELS: AIModelConfig[] = [
  {
    id: "GPT_5_5",
    name: "GPT-5.5",
    provider: "OpenAI",
    description: "Latest flagship model with superior reasoning and creativity",
    speed: "medium",
    quality: "premium",
    cost: "high",
    capabilities: ["Advanced reasoning", "Code generation", "Multi-language", "Image analysis"],
    maxTokens: 128000,
    icon: Sparkles,
  },
  {
    id: "GPT_4_1",
    name: "GPT-4.1",
    provider: "OpenAI",
    description: "High-performance model for complex tasks",
    speed: "medium",
    quality: "high",
    cost: "high",
    capabilities: ["Complex reasoning", "Creative writing", "Technical content"],
    maxTokens: 32000,
    icon: Brain,
  },
  {
    id: "GPT_4",
    name: "GPT-4",
    provider: "OpenAI",
    description: "Balanced performance for most use cases",
    speed: "medium",
    quality: "high",
    cost: "medium",
    capabilities: ["General purpose", "Content generation", "Translation"],
    maxTokens: 8192,
    icon: Cpu,
  },
  {
    id: "GPT_3_5_TURBO",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    description: "Fast and cost-effective for simple tasks",
    speed: "fast",
    quality: "standard",
    cost: "low",
    capabilities: ["Quick generation", "Basic content", "Summarization"],
    maxTokens: 4096,
    icon: Zap,
  },
  {
    id: "CLAUDE_3_OPUS",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    description: "Most capable model for complex analysis",
    speed: "slow",
    quality: "premium",
    cost: "high",
    capabilities: ["Deep analysis", "Long-form content", "Research"],
    maxTokens: 200000,
    icon: Brain,
  },
  {
    id: "CLAUDE_3_SONNET",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    description: "Balanced performance and speed",
    speed: "medium",
    quality: "high",
    cost: "medium",
    capabilities: ["Content creation", "Analysis", "Coding"],
    maxTokens: 100000,
    icon: Cpu,
  },
  {
    id: "CLAUDE_3_HAIKU",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    description: "Fast and efficient for quick tasks",
    speed: "fast",
    quality: "standard",
    cost: "low",
    capabilities: ["Quick responses", "Simple content", "Classification"],
    maxTokens: 200000,
    icon: Zap,
  },
  {
    id: "GEMINI_PRO",
    name: "Gemini Pro",
    provider: "Google",
    description: "Versatile model with multimodal capabilities",
    speed: "medium",
    quality: "high",
    cost: "medium",
    capabilities: ["Multimodal", "Translation", "Code generation"],
    maxTokens: 32000,
    icon: Sparkles,
  },
  {
    id: "GEMINI_ULTRA",
    name: "Gemini Ultra",
    provider: "Google",
    description: "Most advanced multimodal model",
    speed: "slow",
    quality: "premium",
    cost: "high",
    capabilities: ["Advanced multimodal", "Complex reasoning", "Image understanding"],
    maxTokens: 1000000,
    icon: Brain,
  },
];

interface AIModelSelectorProps {
  selectedModel?: AIModel;
  onModelChange: (model: AIModel) => void;
  disabled?: boolean;
}

export function AIModelSelector({ selectedModel = "GPT_4", onModelChange, disabled = false }: AIModelSelectorProps) {
  const [hoveredModel, setHoveredModel] = useState<AIModel | null>(null);

  const selectedConfig = AI_MODELS.find(m => m.id === selectedModel);
  const hoveredConfig = AI_MODELS.find(m => m.id === hoveredModel) || selectedConfig;

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case "fast": return "text-green-600 bg-green-50";
      case "medium": return "text-amber-600 bg-amber-50";
      case "slow": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "premium": return "text-purple-600 bg-purple-50";
      case "high": return "text-blue-600 bg-blue-50";
      case "standard": return "text-gray-600 bg-gray-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case "low": return "text-green-600 bg-green-50";
      case "medium": return "text-amber-600 bg-amber-50";
      case "high": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Select AI Model</Label>
        <Select value={selectedModel} onValueChange={onModelChange} disabled={disabled}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Choose an AI model" />
          </SelectTrigger>
          <SelectContent>
            {AI_MODELS.map((model) => {
              const Icon = model.icon;
              return (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{model.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {model.provider}
                    </Badge>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {hoveredConfig && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  hoveredConfig.quality === "premium" ? "bg-purple-100 text-purple-700" :
                  hoveredConfig.quality === "high" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  <hoveredConfig.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{hoveredConfig.name}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {hoveredConfig.provider}
                  </Badge>
                </div>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{hoveredConfig.description}</p>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted">
                <div className={`text-xs font-medium mb-1 ${getSpeedColor(hoveredConfig.speed).split(" ")[0]}`}>
                  Speed
                </div>
                <div className="text-lg font-bold capitalize">{hoveredConfig.speed}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <div className={`text-xs font-medium mb-1 ${getQualityColor(hoveredConfig.quality).split(" ")[0]}`}>
                  Quality
                </div>
                <div className="text-lg font-bold capitalize">{hoveredConfig.quality}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <div className={`text-xs font-medium mb-1 ${getCostColor(hoveredConfig.cost).split(" ")[0]}`}>
                  Cost
                </div>
                <div className="text-lg font-bold capitalize">{hoveredConfig.cost}</div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Capabilities</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {hoveredConfig.capabilities.map((capability) => (
                  <Badge key={capability} variant="secondary" className="text-xs">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Max Tokens</span>
              <span className="font-medium">{hoveredConfig.maxTokens.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-2">
        {AI_MODELS.slice(0, 6).map((model) => {
          const Icon = model.icon;
          const isSelected = model.id === selectedModel;
          return (
            <button
              key={model.id}
              onClick={() => !disabled && onModelChange(model.id)}
              onMouseEnter={() => setHoveredModel(model.id)}
              onMouseLeave={() => setHoveredModel(null)}
              disabled={disabled}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                isSelected 
                  ? "border-brand-600 bg-brand-50" 
                  : "border-border hover:border-brand-300"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <Icon className="h-4 w-4 mb-2" />
              <div className="text-xs font-medium truncate">{model.name}</div>
              <div className="text-xs text-muted-foreground">{model.provider}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
