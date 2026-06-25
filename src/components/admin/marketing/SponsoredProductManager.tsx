"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Star } from "lucide-react";
import { MarketingShell } from "./MarketingShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SponsoredProductDTO } from "@/lib/marketing/types";

export function SponsoredProductManager() {
  const [items, setItems] = useState<SponsoredProductDTO[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ productId: "", priority: 0, badgeText: "Sponsored", isActive: true });

  const fetchData = async () => {
    const [spRes, prodRes] = await Promise.all([
      fetch("/api/admin/marketing/sponsored-products", { credentials: "include" }),
      fetch("/api/admin/products?limit=100", { credentials: "include" }),
    ]);
    const spJson = await spRes.json();
    const prodJson = await prodRes.json();
    if (spJson.success) setItems(spJson.data ?? []);
    if (prodJson.success) setProducts(prodJson.data?.items ?? prodJson.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!form.productId) return toast.error("Select a product");
    const res = await fetch("/api/admin/marketing/sponsored-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json.success) { toast.success("Added"); setForm({ productId: "", priority: 0, badgeText: "Sponsored", isActive: true }); fetchData(); }
    else toast.error(json.error ?? "Failed");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove sponsorship?")) return;
    const res = await fetch(`/api/admin/marketing/sponsored-products/${id}`, { method: "DELETE", credentials: "include" });
    if ((await res.json()).success) { toast.success("Removed"); fetchData(); }
  };

  return (
    <MarketingShell title="Sponsored Products" description="Promote products with sponsored badges and priority placement.">
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Product</Label>
              <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {Array.isArray(products) && products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Priority</Label><Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: +e.target.value })} /></div>
            <div><Label>Badge</Label><Input value={form.badgeText} onChange={(e) => setForm({ ...form, badgeText: e.target.value })} /></div>
            <div className="flex items-end"><Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" /> Add</Button></div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-700" /></div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-gold-500" />
                  <div>
                    <p className="font-medium">{item.product?.name ?? item.productId}</p>
                    <p className="text-xs text-muted-foreground">
                      <Badge variant="outline">{item.badgeText}</Badge> · Priority {item.priority} · {item.impressions} views
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}><Trash2 className="h-3 w-3" /></Button>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && <p className="text-center text-muted-foreground py-8">No sponsored products yet.</p>}
        </div>
      )}
    </MarketingShell>
  );
}
