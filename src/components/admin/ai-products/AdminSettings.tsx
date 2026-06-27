"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea, Switch, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { 
  Settings, 
  Key, 
  Brain, 
  Shield,
  Globe,
  Sliders,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  apiKey: string;
  monthlyQuota: number;
  usedQuota: number;
}

interface CategoryMapping {
  id: string;
  name: string;
  aiCategory: string;
  confidence: number;
}

interface AdminSettingsProps {
  onSave?: (settings: any) => void;
  disabled?: boolean;
}

export function AdminSettings({ onSave, disabled = false }: AdminSettingsProps) {
  const [activeTab, setActiveTab] = useState<"models" | "keys" | "quotas" | "categories" | "general">("models");
  const [saving, setSaving] = useState(false);
  
  const [aiModels, setAIModels] = useState<AIModel[]>([
    {
      id: "gpt-4",
      name: "GPT-4",
      provider: "OpenAI",
      enabled: true,
      apiKey: "sk-xxxxxxxxxxxx",
      monthlyQuota: 1000,
      usedQuota: 245,
    },
    {
      id: "gpt-3.5",
      name: "GPT-3.5 Turbo",
      provider: "OpenAI",
      enabled: true,
      apiKey: "sk-xxxxxxxxxxxx",
      monthlyQuota: 5000,
      usedQuota: 1200,
    },
    {
      id: "claude-3",
      name: "Claude 3",
      provider: "Anthropic",
      enabled: false,
      apiKey: "",
      monthlyQuota: 1000,
      usedQuota: 0,
    },
    {
      id: "gemini",
      name: "Gemini Pro",
      provider: "Google",
      enabled: true,
      apiKey: "AIxxxxxxxxxxxx",
      monthlyQuota: 2000,
      usedQuota: 156,
    },
  ]);

  const [categoryMappings, setCategoryMappings] = useState<CategoryMapping[]>([
    { id: "1", name: "Electronics", aiCategory: "electronics", confidence: 95 },
    { id: "2", name: "Clothing", aiCategory: "fashion_apparel", confidence: 92 },
    { id: "3", name: "Home & Garden", aiCategory: "home_decor", confidence: 88 },
  ]);

  const [generalSettings, setGeneralSettings] = useState({
    defaultModel: "gpt-4",
    defaultLanguage: "EN",
    autoPublish: false,
    requireReview: true,
    maxRetries: 3,
    rateLimitPerMinute: 60,
    enableBulkGeneration: true,
    enableImageAI: true,
    enableSEOAnalysis: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave?.({
      aiModels,
      categoryMappings,
      generalSettings,
    });
    setSaving(false);
  };

  const toggleModel = (modelId: string) => {
    setAIModels(prev => prev.map(model => 
      model.id === modelId ? { ...model, enabled: !model.enabled } : model
    ));
  };

  const updateModelKey = (modelId: string, apiKey: string) => {
    setAIModels(prev => prev.map(model => 
      model.id === modelId ? { ...model, apiKey } : model
    ));
  };

  const updateQuota = (modelId: string, quota: number) => {
    setAIModels(prev => prev.map(model => 
      model.id === modelId ? { ...model, monthlyQuota: quota } : model
    ));
  };

  const getQuotaPercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  const getQuotaColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-amber-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Product Studio Settings
            </CardTitle>
            <Button onClick={handleSave} disabled={disabled || saving}>
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as "models" | "keys" | "quotas" | "categories" | "general")}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="models">AI Models</TabsTrigger>
              <TabsTrigger value="keys">API Keys</TabsTrigger>
              <TabsTrigger value="quotas">Quotas</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>

            <TabsContent value="models" className="space-y-4 mt-4">
              <div className="space-y-4">
                {aiModels.map((model) => (
                  <div key={model.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-brand-600" />
                        <div>
                          <p className="font-semibold">{model.name}</p>
                          <p className="text-sm text-muted-foreground">{model.provider}</p>
                        </div>
                      </div>
                      <Switch
                        checked={model.enabled}
                        onCheckedChange={() => toggleModel(model.id)}
                        disabled={disabled}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>API Key</Label>
                        <Input
                          type="password"
                          value={model.apiKey}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateModelKey(model.id, e.target.value)}
                          disabled={disabled}
                          placeholder="Enter API key"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Monthly Quota</Label>
                        <Input
                          type="number"
                          value={model.monthlyQuota}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuota(model.id, Number(e.target.value))}
                          disabled={disabled}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Usage</span>
                        <span className={getQuotaColor(getQuotaPercentage(model.usedQuota, model.monthlyQuota))}>
                          {model.usedQuota} / {model.monthlyQuota} ({getQuotaPercentage(model.usedQuota, model.monthlyQuota)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            getQuotaPercentage(model.usedQuota, model.monthlyQuota) >= 90 ? "bg-red-600" :
                            getQuotaPercentage(model.usedQuota, model.monthlyQuota) >= 70 ? "bg-amber-600" :
                            "bg-green-600"
                          }`}
                          style={{ width: `${getQuotaPercentage(model.usedQuota, model.monthlyQuota)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="keys" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-brand-600" />
                    <h3 className="font-semibold">OpenAI API Key</h3>
                  </div>
                  <Input
                    type="password"
                    defaultValue="sk-xxxxxxxxxxxx"
                    disabled={disabled}
                    placeholder="sk-..."
                  />
                  <p className="text-sm text-muted-foreground">
                    Used for GPT models. Get your key from platform.openai.com
                  </p>
                </div>

                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Anthropic API Key</h3>
                  </div>
                  <Input
                    type="password"
                    defaultValue=""
                    disabled={disabled}
                    placeholder="sk-ant-..."
                  />
                  <p className="text-sm text-muted-foreground">
                    Used for Claude models. Get your key from console.anthropic.com
                  </p>
                </div>

                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-cyan-600" />
                    <h3 className="font-semibold">Google API Key</h3>
                  </div>
                  <Input
                    type="password"
                    defaultValue="AIxxxxxxxxxxxx"
                    disabled={disabled}
                    placeholder="AI..."
                  />
                  <p className="text-sm text-muted-foreground">
                    Used for Gemini models. Get your key from console.cloud.google.com
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quotas" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-brand-600" />
                    <h3 className="font-semibold">Rate Limiting</h3>
                  </div>
                  <div>
                    <Label>Requests per Minute</Label>
                    <Input
                      type="number"
                      value={generalSettings.rateLimitPerMinute}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGeneralSettings(prev => ({ ...prev, rateLimitPerMinute: Number(e.target.value) }))}
                      disabled={disabled}
                      className="mt-2"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Maximum number of AI requests allowed per minute
                  </p>
                </div>

                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-amber-600" />
                    <h3 className="font-semibold">Retry Configuration</h3>
                  </div>
                  <div>
                    <Label>Max Retries</Label>
                    <Input
                      type="number"
                      value={generalSettings.maxRetries}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGeneralSettings(prev => ({ ...prev, maxRetries: Number(e.target.value) }))}
                      disabled={disabled}
                      className="mt-2"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Number of automatic retries for failed AI requests
                  </p>
                </div>

                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">Quota Reset</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Monthly Reset</p>
                      <p className="text-sm text-muted-foreground">Reset quotas on the 1st of each month</p>
                    </div>
                    <Switch checked={true} disabled={disabled} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-brand-600" />
                    <h3 className="font-semibold">Category AI Mapping</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Map your store categories to AI-detected categories for better classification
                  </p>
                </div>

                {categoryMappings.map((mapping) => (
                  <div key={mapping.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{mapping.name}</p>
                        <p className="text-sm text-muted-foreground">Store Category</p>
                      </div>
                      <Badge variant="outline">{mapping.confidence}% confidence</Badge>
                    </div>
                    <div>
                      <Label>AI Category</Label>
                      <Input
                        value={mapping.aiCategory}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setCategoryMappings(prev => prev.map(m => 
                            m.id === mapping.id ? { ...m, aiCategory: e.target.value } : m
                          ));
                        }}
                        disabled={disabled}
                        className="mt-2"
                      />
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full" disabled={disabled}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Auto-Detect Categories
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-brand-600" />
                    <h3 className="font-semibold">Default AI Settings</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Default Model</Label>
                      <Select 
                        value={generalSettings.defaultModel}
                        onValueChange={(v: string) => setGeneralSettings(prev => ({ ...prev, defaultModel: v }))}
                        disabled={disabled}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="claude-3">Claude 3</SelectItem>
                          <SelectItem value="gemini">Gemini Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Default Language</Label>
                      <Select 
                        value={generalSettings.defaultLanguage}
                        onValueChange={(v: string) => setGeneralSettings(prev => ({ ...prev, defaultLanguage: v }))}
                        disabled={disabled}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EN">English</SelectItem>
                          <SelectItem value="FR">French</SelectItem>
                          <SelectItem value="AR">Arabic</SelectItem>
                          <SelectItem value="ES">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">Workflow Settings</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-Publish</p>
                        <p className="text-sm text-muted-foreground">Automatically publish approved products</p>
                      </div>
                      <Switch
                        checked={generalSettings.autoPublish}
                        onCheckedChange={(v: boolean) => setGeneralSettings(prev => ({ ...prev, autoPublish: v }))}
                        disabled={disabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Require Review</p>
                        <p className="text-sm text-muted-foreground">Require manual review before publishing</p>
                      </div>
                      <Switch
                        checked={generalSettings.requireReview}
                        onCheckedChange={(v: boolean) => setGeneralSettings(prev => ({ ...prev, requireReview: v }))}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Feature Toggles</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Bulk Generation</p>
                        <p className="text-sm text-muted-foreground">Enable bulk product generation</p>
                      </div>
                      <Switch
                        checked={generalSettings.enableBulkGeneration}
                        onCheckedChange={(v: boolean) => setGeneralSettings(prev => ({ ...prev, enableBulkGeneration: v }))}
                        disabled={disabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Image AI</p>
                        <p className="text-sm text-muted-foreground">Enable AI image processing</p>
                      </div>
                      <Switch
                        checked={generalSettings.enableImageAI}
                        onCheckedChange={(v: boolean) => setGeneralSettings(prev => ({ ...prev, enableImageAI: v }))}
                        disabled={disabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SEO Analysis</p>
                        <p className="text-sm text-muted-foreground">Enable automatic SEO analysis</p>
                      </div>
                      <Switch
                        checked={generalSettings.enableSEOAnalysis}
                        onCheckedChange={(v: boolean) => setGeneralSettings(prev => ({ ...prev, enableSEOAnalysis: v }))}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Status Banner */}
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div className="flex-1">
          <p className="font-medium text-green-900">Settings Active</p>
          <p className="text-sm text-green-700">Your AI Product Studio is configured and ready</p>
        </div>
      </div>
    </div>
  );
}
