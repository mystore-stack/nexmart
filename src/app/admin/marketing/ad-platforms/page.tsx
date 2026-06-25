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
import { MarketingShell } from "@/components/admin/marketing/MarketingShell";

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
}

export default function AdPlatformsPage() {
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
    fetch("/api/admin/marketing/campaigns", { credentials: "include" })
      .then((r) => r.json())
      .then((result) => { if (result.success) setCampaigns(result.data); setLoading(false); });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/admin/marketing/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...formData, budget: formData.budget ? parseFloat(formData.budget) : undefined }),
    });
    const result = await response.json();
    if (result.success) {
      setIsCreateDialogOpen(false);
      setFormData({ name: "", platform: "facebook", campaignId: "", budget: "", startDate: "", endDate: "", utmSource: "", utmMedium: "", utmCampaign: "" });
      setCampaigns((prev) => [result.data, ...prev]);
    }
  };

  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);

  return (
    <MarketingShell title="Ad Platforms" description="Track Facebook, Google, TikTok and external ad platform campaigns.">
      <div className="mb-4 flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New Platform Campaign</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Platform Campaign</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div><Label>Platform</Label>
                <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["facebook", "google", "tiktok", "email", "other"].map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Start Date</Label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required /></div>
              <Button type="submit">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card><CardHeader><CardTitle className="text-sm">Total Spent</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatPrice(totalSpent)}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Total Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div></CardContent></Card>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" /></div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Campaign</TableHead><TableHead>Platform</TableHead><TableHead>Status</TableHead><TableHead>Spent</TableHead><TableHead>Revenue</TableHead></TableRow></TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.platform}</TableCell>
                    <TableCell><Badge>{c.status}</Badge></TableCell>
                    <TableCell>{formatPrice(c.spent)}</TableCell>
                    <TableCell>{formatPrice(c.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </MarketingShell>
  );
}
