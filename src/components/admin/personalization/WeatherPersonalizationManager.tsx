"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit, Cloud, Droplet, Wind, Thermometer } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WeatherPersonalization {
  id: string;
  condition: string;
  minTemperature?: number;
  maxTemperature?: number;
  title: string;
  productIds: string[];
  isActive: boolean;
}

const WEATHER_CONDITIONS = [
  { value: "SUNNY", label: "Sunny", icon: "☀️" },
  { value: "CLOUDY", label: "Cloudy", icon: "☁️" },
  { value: "RAINY", label: "Rainy", icon: "🌧️" },
  { value: "SNOWY", label: "Snowy", icon: "❄️" },
  { value: "WINDY", label: "Windy", icon: "💨" },
  { value: "HOT", label: "Hot", icon: "🔥" },
  { value: "COLD", label: "Cold", icon: "🥶" },
];

export function WeatherPersonalizationManager() {
  const [personalizations, setPersonalizations] = useState<WeatherPersonalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    condition: "SUNNY",
    minTemperature: "",
    maxTemperature: "",
    title: "",
    productIds: "",
  });

  useEffect(() => {
    fetchPersonalizations();
  }, []);

  const fetchPersonalizations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/personalization/weather", {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setPersonalizations(data.data || []);
      } else {
        toast.error("Failed to load weather personalizations");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setSaving(true);
      const method = editingId ? "PUT" : "POST";
      const payload = {
        id: editingId,
        condition: formData.condition,
        minTemperature: formData.minTemperature ? parseFloat(formData.minTemperature) : null,
        maxTemperature: formData.maxTemperature ? parseFloat(formData.maxTemperature) : null,
        title: formData.title,
        productIds: formData.productIds.split(",").filter((id) => id.trim()),
      };

      const res = await fetch("/api/admin/personalization/weather", {
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
          condition: "SUNNY",
          minTemperature: "",
          maxTemperature: "",
          title: "",
          productIds: "",
        });
        await fetchPersonalizations();
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
      const res = await fetch(`/api/admin/personalization/weather?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Deleted successfully");
        await fetchPersonalizations();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (item: WeatherPersonalization) => {
    setEditingId(item.id);
    setFormData({
      condition: item.condition,
      minTemperature: item.minTemperature?.toString() || "",
      maxTemperature: item.maxTemperature?.toString() || "",
      title: item.title,
      productIds: item.productIds.join(", "),
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin">
          <Cloud className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Weather-Based Personalization</h2>
          <p className="text-muted-foreground">
            Show different products based on weather conditions
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingId(null);
              setFormData({
                condition: "SUNNY",
                minTemperature: "",
                maxTemperature: "",
                title: "",
                productIds: "",
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
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Summer Fashion"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
                className="w-full border border-border rounded-lg p-2 bg-background"
              >
                {WEATHER_CONDITIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Min Temperature (°C)
              </label>
              <Input
                type="number"
                value={formData.minTemperature}
                onChange={(e) =>
                  setFormData({ ...formData, minTemperature: e.target.value })
                }
                placeholder="e.g., 20"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Max Temperature (°C)
              </label>
              <Input
                type="number"
                value={formData.maxTemperature}
                onChange={(e) =>
                  setFormData({ ...formData, maxTemperature: e.target.value })
                }
                placeholder="e.g., 30"
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
        {personalizations.length === 0 ? (
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <Cloud className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No weather rules configured</p>
          </div>
        ) : (
          personalizations.map((item, index) => {
            const condInfo = WEATHER_CONDITIONS.find(
              (c) => c.value === item.condition
            );

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-3xl">{condInfo?.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <div className="text-sm text-muted-foreground space-x-2">
                      <span>{condInfo?.label}</span>
                      {item.minTemperature || item.maxTemperature ? (
                        <>
                          <span>•</span>
                          <span>
                            {item.minTemperature || "-∞"}°C to{" "}
                            {item.maxTemperature || "∞"}°C
                          </span>
                        </>
                      ) : null}
                      <span>•</span>
                      <span>{item.productIds.length} products</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
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
