"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Zap } from "lucide-react";
import { MarketingShell } from "./MarketingShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { slugify } from "@/lib/marketing/schemas";
import type { FlashDealDTO } from "@/lib/marketing/types";

export function FlashDealManager() {
  const [deals, setDeals] = useState<FlashDealDTO[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    discountPercent: 20,
    startDate: "",
    endDate: "",
    productIds: [] as string[],
    status: "DRAFT" as const,
    isActive: false,
    autoStart: true,
    autoEnd: true,
  });

  const fetchData = async () => {
    const [dealRes, prodRes] = await Promise.all([
      fetch("/api/admin/marketing/flash-deals", { credentials: "include" }),
      fetch("/api/admin/products?limit=100", { credentials: "include" }),
    ]);
    const dealJson = await dealRes.json();
    const prodJson = await prodRes.json();
    if (dealJson.success) setDeals(dealJson.data ?? []);
    if (prodJson.success) setProducts(Array.isArray(prodJson.products) ? prodJson.products : []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.startDate || !form.endDate) return toast.error("Fill required fields");
    const res = await fetch("/api/admin/marketing/flash-deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...form,
        slug: form.slug || slugify(form.name),
        productIds: form.productIds.map((id, i) => ({ productId: id, displayOrder: i, discountPercent: form.discountPercent })),
      }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Flash deal created");
      setForm({ name: "", slug: "", discountPercent: 20, startDate: "", endDate: "", productIds: [], status: "DRAFT", isActive: false, autoStart: true, autoEnd: true });
      fetchData();
    } else toast.error(json.error ?? "Failed");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete flash deal?")) return;
    const res = await fetch(`/api/admin/marketing/flash-deals/${id}`, { method: "DELETE", credentials: "include" });
    if ((await res.json()).success) { toast.success("Deleted"); fetchData(); }
  };

  const toggleProduct = (id: string) => {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id) ? f.productIds.filter((p) => p !== id) : [...f.productIds, id],
    }));
  };

  return (
    <MarketingShell title="Flash Deals" description="Time-limited sales with countdown timers and auto start/end.">
      <Card className="mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} /></div>
            <div><Label>Discount %</Label><Input type="number" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: +e.target.value })} /></div>
            <div><Label>Start *</Label><Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><Label>End *</Label><Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
          </div>
          <div>
            <Label>Products</Label>
            <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {Array.isArray(products) && products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProduct(p.id)}
                  className={`rounded-full px-3 py-1 text-xs border ${form.productIds.includes(p.id) ? "bg-brand-700 text-white border-brand-700" : "border-border"}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.autoStart} onChange={(e) => setForm({ ...form, autoStart: e.target.checked })} /> Auto Start</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.autoEnd} onChange={(e) => setForm({ ...form, autoEnd: e.target.checked })} /> Auto End</label>
          </div>
          <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" /> Create Flash Deal</Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-700" /></div>
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => (
            <Card key={deal.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-semibold">{deal.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {deal.discountPercent}% off · {deal.products?.length ?? 0} products ·
                      <Badge className="ml-1">{deal.status}</Badge>
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleDelete(deal.id)}><Trash2 className="h-3 w-3" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </MarketingShell>
  );
}
