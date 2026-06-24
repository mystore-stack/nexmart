"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Play, Pause, Trash2, Edit, TrendingUp, BarChart3 } from "lucide-react";

interface Experiment {
  id: string;
  name: string;
  description?: string;
  trafficSplit: number;
  status: string;
  startDate?: string;
  endDate?: string;
  winningVariant?: string;
  createdAt: string;
  variants: Array<{
    id: string;
    name: string;
    description?: string;
    config?: any;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  _count: {
    assignments: number;
  };
}

export default function ExperimentsPage() {
  const [tests, setTests] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    variants: [
      { name: "Variant A", description: "", config: {} },
      { name: "Variant B", description: "", config: {} },
    ],
    trafficSplit: 50,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch("/api/admin/experiments", { credentials: "include" });
      const result = await response.json();
      if (result.success) {
        setTests(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        setIsCreateDialogOpen(false);
        setFormData({
          name: "",
          description: "",
          variants: [
            { name: "Variant A", description: "", config: {} },
            { name: "Variant B", description: "", config: {} },
          ],
          trafficSplit: 50,
          startDate: "",
          endDate: "",
        });
        fetchTests();
      }
    } catch (error) {
      console.error("Failed to create test:", error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/experiments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      fetchTests();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      await fetch(`/api/admin/experiments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchTests();
    } catch (error) {
      console.error("Failed to delete test:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-green-500/10 text-green-500";
      case "paused": return "bg-yellow-500/10 text-yellow-500";
      case "completed": return "bg-blue-500/10 text-blue-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  const calculateCTR = (impressions: number, clicks: number) => {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00";
  };

  const calculateConversionRate = (impressions: number, conversions: number) => {
    return impressions > 0 ? ((conversions / impressions) * 100).toFixed(2) : "0.00";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">A/B Testing</h1>
          <p className="text-muted-foreground text-sm mt-1">Run experiments to optimize conversions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Experiment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create A/B Test</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Test Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <p className="text-sm font-medium">Variants</p>
                {formData.variants.map((variant, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div>
                      <Label>Variant Name</Label>
                      <Input
                        value={variant.name}
                        onChange={(e: any) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].name = e.target.value;
                          setFormData({ ...formData, variants: newVariants });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={variant.description || ""}
                        onChange={(e: any) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].description = e.target.value;
                          setFormData({ ...formData, variants: newVariants });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <Label htmlFor="trafficSplit">Traffic Split for Variant A (%)</Label>
                <Input
                  id="trafficSplit"
                  type="number"
                  min="1"
                  max="99"
                  value={formData.trafficSplit}
                  onChange={(e) => setFormData({ ...formData, trafficSplit: parseInt(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Test</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Tests */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  {test.description && (
                    <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                  )}
                </div>
                <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Traffic Split</p>
                  <p className="text-sm font-semibold">{test.trafficSplit}% / {100 - test.trafficSplit}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-semibold">
                    {test.startDate ? new Date(test.startDate).toLocaleDateString() : "Not set"}
                  </p>
                </div>
              </div>

              {/* Variant Performance */}
              {test.variants.map((variant, index) => (
                <div key={variant.id} className="space-y-2">
                  <p className="text-xs font-semibold">{variant.name}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Impressions</p>
                      <p className="font-medium">{variant.impressions || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CTR</p>
                      <p className="font-medium">{calculateCTR(variant.impressions || 0, variant.clicks || 0)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conv. Rate</p>
                      <p className="font-medium">{calculateConversionRate(variant.impressions || 0, variant.conversions || 0)}%</p>
                    </div>
                  </div>
                </div>
              ))}

              {test.winningVariant && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <p className="text-sm font-semibold text-green-500">
                      Winner: {test.winningVariant}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {test.status === "draft" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(test.id, "running")}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Start
                  </Button>
                )}
                {test.status === "running" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(test.id, "paused")}
                  >
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </Button>
                )}
                {test.status === "paused" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(test.id, "running")}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Resume
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(test.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No A/B tests yet. Create your first experiment!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
