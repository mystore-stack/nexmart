"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";
import { formatPrice } from "@/utils/format";

interface Campaign {
  id: string;
  name: string;
  platform: string;
  campaignId?: string;
  status: string;
  budget?: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  startDate: string;
  endDate?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: string;
}

export default function MarketingCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    platform: "facebook",
    campaignId: "",
    budget: "",
    startDate: "",
    endDate: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/admin/marketing/campaigns", { credentials: "include" });
      const result = await response.json();
      if (result.success) {
        setCampaigns(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setIsCreateDialogOpen(false);
        setFormData({
          name: "",
          platform: "facebook",
          campaignId: "",
          budget: "",
          startDate: "",
          endDate: "",
          utmSource: "",
          utmMedium: "",
          utmCampaign: "",
        });
        fetchCampaigns();
      }
    } catch (error) {
      console.error("Failed to create campaign:", error);
    }
  };

  const calculateROAS = (revenue: number, spent: number) => {
    return spent > 0 ? (revenue / spent).toFixed(2) : "0.00";
  };

  const calculateCPA = (spent: number, conversions: number) => {
    return conversions > 0 ? (spent / conversions).toFixed(2) : "0.00";
  };

  const calculateCTR = (impressions: number, clicks: number) => {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00";
  };

  const calculateConversionRate = (clicks: number, conversions: number) => {
    return clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : "0.00";
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook": return "📘";
      case "google": return "🔍";
      case "tiktok": return "🎵";
      case "email": return "📧";
      default: return "📢";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500";
      case "paused": return "bg-yellow-500/10 text-yellow-500";
      case "completed": return "bg-blue-500/10 text-blue-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Calculate overview metrics
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const overallROAS = totalSpent > 0 ? (totalRevenue / totalSpent).toFixed(2) : "0.00";
  const overallCPA = totalConversions > 0 ? (totalSpent / totalConversions).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketing Campaigns</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and optimize your ad campaigns</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Marketing Campaign</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="google">Google Ads</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="campaignId">External Campaign ID</Label>
                  <Input
                    id="campaignId"
                    value={formData.campaignId}
                    onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="utmSource">UTM Source</Label>
                  <Input
                    id="utmSource"
                    value={formData.utmSource}
                    onChange={(e) => setFormData({ ...formData, utmSource: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="utmMedium">UTM Medium</Label>
                  <Input
                    id="utmMedium"
                    value={formData.utmMedium}
                    onChange={(e) => setFormData({ ...formData, utmMedium: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="utmCampaign">UTM Campaign</Label>
                  <Input
                    id="utmCampaign"
                    value={formData.utmCampaign}
                    onChange={(e) => setFormData({ ...formData, utmCampaign: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Campaign</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalBudget)}</div>
            <p className="text-xs text-muted-foreground mt-1">{formatPrice(totalSpent)} spent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalConversions} conversions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROAS</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallROAS}x</div>
            <p className="text-xs text-muted-foreground mt-1">Return on ad spend</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPA</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(parseFloat(overallCPA))}</div>
            <p className="text-xs text-muted-foreground mt-1">Cost per acquisition</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget/Spent</TableHead>
                <TableHead>ROAS</TableHead>
                <TableHead>CPA</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead>Conv. Rate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      {campaign.campaignId && (
                        <p className="text-xs text-muted-foreground">{campaign.campaignId}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-lg">{getPlatformIcon(campaign.platform)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{formatPrice(campaign.spent)}</p>
                      {campaign.budget && (
                        <p className="text-xs text-muted-foreground">of {formatPrice(campaign.budget)}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{calculateROAS(campaign.revenue, campaign.spent)}x</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{formatPrice(parseFloat(calculateCPA(campaign.spent, campaign.conversions)))}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{calculateCTR(campaign.impressions, campaign.clicks)}%</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{calculateConversionRate(campaign.clicks, campaign.conversions)}%</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {campaigns.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns yet. Create your first campaign to start tracking!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
