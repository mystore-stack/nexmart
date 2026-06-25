"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { MarketingShell } from "./MarketingShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { promoCampaignSchema, slugify, type PromoCampaignInput } from "@/lib/marketing/schemas";
import { PROMO_CAMPAIGN_TYPE_LABELS } from "@/lib/marketing/types";
import type { PromoCampaignDTO } from "@/lib/marketing/types";

const defaults: PromoCampaignInput = {
  name: "",
  slug: "",
  type: "CUSTOM",
  description: "",
  status: "DRAFT",
  startDate: undefined,
  endDate: undefined,
  bannerColor: "#0F766E",
};

export function PromoCampaignManager() {
  const [campaigns, setCampaigns] = useState<PromoCampaignDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const form = useForm<PromoCampaignInput>({
    resolver: zodResolver(promoCampaignSchema),
    defaultValues: defaults,
  });

  const fetchData = async () => {
    const res = await fetch("/api/admin/marketing/promo-campaigns", { credentials: "include" });
    const json = await res.json();
    if (json.success) setCampaigns(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const onSubmit = async (data: PromoCampaignInput) => {
    const payload = { ...data, slug: data.slug || slugify(data.name) };
    const url = editId ? `/api/admin/marketing/promo-campaigns/${editId}` : "/api/admin/marketing/promo-campaigns";
    const res = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success) {
      toast.success(editId ? "Updated" : "Created");
      setShowForm(false);
      setEditId(null);
      form.reset(defaults);
      fetchData();
    } else toast.error(json.error ?? "Failed");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete campaign and unlink ads?")) return;
    const res = await fetch(`/api/admin/marketing/promo-campaigns/${id}`, { method: "DELETE", credentials: "include" });
    if ((await res.json()).success) { toast.success("Deleted"); fetchData(); }
  };

  return (
    <MarketingShell
      title="Marketing Campaigns"
      description="Black Friday, Ramadan, seasonal sales — group advertisements under campaigns."
      actions={
        <Button onClick={() => { setShowForm(true); setEditId(null); form.reset(defaults); }}>
          <Plus className="mr-2 h-4 w-4" /> New Campaign
        </Button>
      }
    >
      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Name *</Label>
                  <Input {...form.register("name")} onBlur={() => {
                    if (!form.getValues("slug")) form.setValue("slug", slugify(form.getValues("name")));
                  }} />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input {...form.register("slug")} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Type</Label>
                  <Select value={form.watch("type")} onValueChange={(v) => form.setValue("type", v as PromoCampaignInput["type"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROMO_CAMPAIGN_TYPE_LABELS).map(([k, label]) => (
                        <SelectItem key={k} value={k}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as PromoCampaignInput["status"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["DRAFT", "PUBLISHED", "SCHEDULED"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Description</Label><Textarea {...form.register("description")} rows={2} /></div>
              <div className="grid gap-4 md:grid-cols-3">
                <div><Label>Start</Label><Input type="datetime-local" {...form.register("startDate")} /></div>
                <div><Label>End</Label><Input type="datetime-local" {...form.register("endDate")} /></div>
                <div><Label>Banner Color</Label><Input type="color" {...form.register("bannerColor")} /></div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-700" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{c.name}</h4>
                    <p className="text-xs text-muted-foreground">{PROMO_CAMPAIGN_TYPE_LABELS[c.type]}</p>
                  </div>
                  <Badge>{c.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{c._count?.advertisements ?? 0} ads · {c._count?.flashDeals ?? 0} flash deals</p>
                <p className="text-xs text-muted-foreground">{c.impressions} views · {c.clicks} clicks · {c.revenue.toFixed(0)} MAD revenue</p>
                <div className="mt-3 flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditId(c.id);
                    form.reset({
                      name: c.name,
                      slug: c.slug,
                      type: c.type,
                      description: c.description ?? "",
                      status: c.status,
                      startDate: c.startDate ?? undefined,
                      endDate: c.endDate ?? undefined,
                      bannerColor: c.bannerColor ?? "#0F766E",
                    });
                    setShowForm(true);
                  }}><Edit className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(c.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </MarketingShell>
  );
}
