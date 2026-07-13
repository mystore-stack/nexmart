"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit, Sparkles, Brain } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AIRecommendationRule {
  id: string;
  name: string;
  strategy: string;
  minScore: number;
  maxResults: number;
  productIds: string[];
  isActive: boolean;
}

const STRATEGIES = [
  { value: "WEATHER_BASED", label: "Weather-Based", icon: "🌤️" },
  { value: "AI_POWERED", label: "AI-Powered", icon: "🤖" },
  { value: "USER_BEHAVIOR", label: "User Behavior", icon: "👤" },
  { value: "MANUAL", label: "Manual", icon: "👆" },
];

export function AIRecommendationsManager() {
  const [rules, setRules] = useState<AIRecommendationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    strategy: "AI_POWERED",
    minScore: "0.5",
    maxResults: "5",
    productIds: "",
    description: "",
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/personalization/ai-recommendations", {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setRules(data.data || []);
      } else {
        toast.error("Failed to load AI rules");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setSaving(true);
      const method = editingId ? "PUT" : "POST";
      const payload = {
        id: editingId,
        name: formData.name,
        description: formData.description,
        strategy: formData.strategy,
        minScore: parseFloat(formData.minScore),
        maxResults: parseInt(formData.maxResults),
        productIds: formData.productIds.split(",").filter((id) => id.trim()),
      };

      const res = await fetch("/api/admin/personalization/ai-recommendations", {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Updated successfully" : "Created successfully");
        setShowForm(false);
        setEditingId(null);
        setFormData({
          name: "",
          strategy: "AI_POWERED",
          minScore: "0.5",
          maxResults: "5",
          productIds: "",
          description: "",
        });
        await fetchRules();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const res = await fetch(
        `/api/admin/personalization/ai-recommendations?id=${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Deleted successfully");
        await fetchRules();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (item: AIRecommendationRule) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      strategy: item.strategy,
      minScore: item.minScore.toString(),
      maxResults: item.maxResults.toString(),
      productIds: item.productIds.join(", "),
      description: "",
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin">
          <Brain className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            AI Recommendations
          </h2>
          <p className="text-muted-foreground">
            Configure intelligent product recommendations using AI
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingId(null);
              setFormData({
                name: "",
                strategy: "AI_POWERED",
                minScore: "0.5",
                maxResults: "5",
                productIds: "",
                description: "",
              });
            }
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card border border-border rounded-lg p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rule Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Top-Rated Products"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Strategy</label>
              <select
                value={formData.strategy}
                onChange={(e) =>
                  setFormData({ ...formData, strategy: e.target.value })
                }
                className="w-full border border-border rounded-lg p-2 bg-background"
              >
                {STRATEGIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Min Confidence Score
              </label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={formData.minScore}
                onChange={(e) =>
                  setFormData({ ...formData, minScore: e.target.value })
                }
                placeholder="0.5"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Max Results
              </label>
              <Input
                type="number"
                min="1"
                max="50"
                value={formData.maxResults}
                onChange={(e) =>
                  setFormData({ ...formData, maxResults: e.target.value })
                }
                placeholder="5"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="What this rule does..."
                className="w-full border border-border rounded-lg p-2 bg-background min-h-[80px]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">
                Product IDs (comma-separated)
              </label>
              <textarea
                value={formData.productIds}
                onChange={(e) =>
                  setFormData({ ...formData, productIds: e.target.value })
                }
                placeholder="uuid1, uuid2, uuid3"
                className="w-full border border-border rounded-lg p-2 bg-background font-mono text-sm min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </div>
        </motion.div>
      )}

      {/* List */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No AI rules configured</p>
          </div>
        ) : (
          rules.map((rule, index) => {
            const stratInfo = STRATEGIES.find(
              (s) => s.value === rule.strategy
            );

            return (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-3xl">{stratInfo?.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{rule.name}</h3>
                    <div className="text-sm text-muted-foreground space-x-2">
                      <span>{stratInfo?.label}</span>
                      <span>•</span>
                      <span>Score ≥ {rule.minScore}</span>
                      <span>•</span>
                      <span>Max {rule.maxResults} results</span>
                      <span>•</span>
                      <span>{rule.productIds.length} products</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(rule)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
