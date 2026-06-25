"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  Plus, Edit, Trash2, Copy, Eye, EyeOff, Calendar,
} from "lucide-react";
import { MarketingShell } from "./MarketingShell";
import { ImageUploadField } from "./ImageUploadField";
import { AdvertisementPreview } from "@/components/marketing/AdBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { advertisementSchema, type AdvertisementInput } from "@/lib/marketing/schemas";
import { AD_PLACEMENT_LABELS, VISITOR_TARGET_LABELS } from "@/lib/marketing/types";
import type { AdvertisementDTO } from "@/lib/marketing/types";

const defaultValues: AdvertisementInput = {
  title: "",
  subtitle: "",
  description: "",
  imageDesktop: null,
  imageMobile: null,
  videoUrl: null,
  ctaText: "",
  ctaUrl: "",
  backgroundColor: "#0F766E",
  textColor: "#FFFFFF",
  placement: "HOMEPAGE_HERO",
  priority: 0,
  status: "DRAFT",
  startDate: undefined,
  endDate: undefined,
  campaignId: null,
  targetCountries: [],
  targetLanguages: [],
  targetDevices: "ALL",
  visitorTarget: "ALL",
};

export function AdvertisementManager() {
  const [ads, setAds] = useState<AdvertisementDTO[]>([]);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const form = useForm<AdvertisementInput>({
    resolver: zodResolver(advertisementSchema),
    defaultValues,
  });

  const watchAll = form.watch();

  const fetchData = async () => {
    const [adsRes, campRes] = await Promise.all([
      fetch("/api/admin/marketing/advertisements", { credentials: "include" }),
      fetch("/api/admin/marketing/promo-campaigns", { credentials: "include" }),
    ]);
    const adsJson = await adsRes.json();
    const campJson = await campRes.json();
    if (adsJson.success) setAds(adsJson.data ?? []);
    if (campJson.success) setCampaigns(campJson.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const onSubmit = async (data: AdvertisementInput) => {
    const url = editId
      ? `/api/admin/marketing/advertisements/${editId}`
      : "/api/admin/marketing/advertisements";
    const res = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      toast.success(editId ? "Updated" : "Created");
      setShowForm(false);
      setEditId(null);
      form.reset(defaultValues);
      fetchData();
    } else toast.error(json.error ?? "Failed");
  };

  const handleEdit = (ad: AdvertisementDTO) => {
    setEditId(ad.id);
    form.reset({
      title: ad.title,
      subtitle: ad.subtitle ?? "",
      description: ad.description ?? "",
      imageDesktop: ad.imageDesktop,
      imageMobile: ad.imageMobile,
      videoUrl: ad.videoUrl,
      ctaText: ad.ctaText ?? "",
      ctaUrl: ad.ctaUrl ?? "",
      backgroundColor: ad.backgroundColor,
      textColor: ad.textColor,
      placement: ad.placement,
      priority: ad.priority,
      status: ad.status,
      startDate: ad.startDate ?? undefined,
      endDate: ad.endDate ?? undefined,
      campaignId: ad.campaignId,
      targetCountries: ad.targetCountries,
      targetLanguages: ad.targetLanguages,
      targetDevices: ad.targetDevices,
      visitorTarget: ad.visitorTarget,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this advertisement?")) return;
    const res = await fetch(`/api/admin/marketing/advertisements/${id}`, { method: "DELETE", credentials: "include" });
    const json = await res.json();
    if (json.success) { toast.success("Deleted"); fetchData(); }
  };

  const handleDuplicate = async (id: string) => {
    const res = await fetch(`/api/admin/marketing/advertisements/${id}/duplicate`, { method: "POST", credentials: "include" });
    const json = await res.json();
    if (json.success) { toast.success("Duplicated"); fetchData(); }
  };

  const handlePublish = async (id: string, action: "publish" | "unpublish") => {
    const res = await fetch(`/api/admin/marketing/advertisements/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action }),
    });
    const json = await res.json();
    if (json.success) { toast.success(action === "publish" ? "Published" : "Unpublished"); fetchData(); }
  };

  return (
    <MarketingShell
      title="Advertisements"
      description="Create, schedule, and manage advertisements across your store."
      actions={
        <Button onClick={() => { setShowForm(true); setEditId(null); form.reset(defaultValues); }}>
          <Plus className="mr-2 h-4 w-4" /> New Ad
        </Button>
      }
    >
      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">{editId ? "Edit" : "Create"} Advertisement</h3>
              <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
                <Eye className="mr-1 h-4 w-4" /> {preview ? "Form" : "Preview"}
              </Button>
            </div>

            {preview ? (
              <AdvertisementPreview ad={watchAll as Partial<AdvertisementDTO>} />
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Title *</Label>
                    <Input {...form.register("title")} />
                  </div>
                  <div>
                    <Label>Subtitle</Label>
                    <Input {...form.register("subtitle")} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea {...form.register("description")} rows={3} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <ImageUploadField
                    label="Desktop Image"
                    value={form.watch("imageDesktop")}
                    onChange={(url) => form.setValue("imageDesktop", url)}
                  />
                  <ImageUploadField
                    label="Mobile Image"
                    value={form.watch("imageMobile")}
                    onChange={(url) => form.setValue("imageMobile", url)}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>CTA Button</Label>
                    <Input {...form.register("ctaText")} placeholder="Shop Now" />
                  </div>
                  <div>
                    <Label>CTA URL</Label>
                    <Input {...form.register("ctaUrl")} placeholder="/products" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <div>
                    <Label>Background</Label>
                    <Input type="color" {...form.register("backgroundColor")} />
                  </div>
                  <div>
                    <Label>Text Color</Label>
                    <Input type="color" {...form.register("textColor")} />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Input type="number" {...form.register("priority", { valueAsNumber: true })} />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as AdvertisementInput["status"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Placement</Label>
                    <Select value={form.watch("placement")} onValueChange={(v) => form.setValue("placement", v as AdvertisementInput["placement"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(AD_PLACEMENT_LABELS).map(([k, label]) => (
                          <SelectItem key={k} value={k}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Device Target</Label>
                    <Select value={form.watch("targetDevices")} onValueChange={(v) => form.setValue("targetDevices", v as AdvertisementInput["targetDevices"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["ALL", "DESKTOP", "MOBILE", "TABLET"].map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Visitor Target</Label>
                    <Select value={form.watch("visitorTarget")} onValueChange={(v) => form.setValue("visitorTarget", v as AdvertisementInput["visitorTarget"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(VISITOR_TARGET_LABELS).map(([k, label]) => (
                          <SelectItem key={k} value={k}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Campaign</Label>
                    <Select value={form.watch("campaignId") ?? "none"} onValueChange={(v) => form.setValue("campaignId", v === "none" ? null : v)}>
                      <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {campaigns.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <Input type="datetime-local" {...form.register("startDate")} />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="datetime-local" {...form.register("endDate")} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-700" />
        </div>
      ) : ads.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No advertisements yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => (
            <Card key={ad.id}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold truncate">{ad.title}</h4>
                    <Badge variant="outline">{AD_PLACEMENT_LABELS[ad.placement]}</Badge>
                    <Badge className={ad.status === "PUBLISHED" ? "bg-green-500/10 text-green-600" : ""}>{ad.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Priority {ad.priority} · {ad.impressions} views · {ad.clicks} clicks
                    {ad.startDate && <> · <Calendar className="inline h-3 w-3" /> scheduled</>}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(ad)}><Edit className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => handleDuplicate(ad.id)}><Copy className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => handlePublish(ad.id, ad.status === "PUBLISHED" ? "unpublish" : "publish")}>
                    {ad.status === "PUBLISHED" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(ad.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </MarketingShell>
  );
}
