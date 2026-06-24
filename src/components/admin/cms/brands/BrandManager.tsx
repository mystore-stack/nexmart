"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { CmsShell } from "@/components/admin/cms/shell/CmsShell";
import { DragDropList } from "@/components/admin/cms/shared/DragDropList";
import { createBrand, deleteBrand } from "@/lib/cms/actions";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

export function BrandManager() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const fetchBrands = async () => {
    const res = await fetch("/api/admin/cms/brands");
    const data = await res.json();
    if (data.success) setBrands(data.brands);
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const result = await createBrand({ name: name.trim(), isActive: true, isFeatured: false, displayOrder: brands.length });
    if (result.success) {
      toast.success("Brand created");
      setName("");
      fetchBrands();
    } else toast.error(result.error);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    const result = await deleteBrand(id);
    if (result.success) {
      toast.success("Brand deleted");
      fetchBrands();
    } else toast.error(result.error);
  };

  return (
    <CmsShell title="Brand Management" description="Manage featured brands for homepage and catalog sections.">
      <div className="mb-6 flex gap-2">
        <input
          className="input flex-1"
          placeholder="Brand name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button type="button" onClick={handleCreate} className="btn-primary inline-flex items-center gap-1.5 px-4">
          <Plus className="h-4 w-4" /> Add Brand
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <DragDropList
          items={brands}
          onReorder={setBrands}
          renderItem={(brand) => (
            <div className="flex items-center justify-between gap-3 px-3 py-2">
              <div className="flex items-center gap-3">
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt={brand.name} className="h-8 w-8 rounded object-contain" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-bold">
                    {brand.name[0]}
                  </div>
                )}
                <div>
                  <p className="font-medium">{brand.name}</p>
                  <p className="text-xs text-muted-foreground">/{brand.slug}</p>
                </div>
              </div>
              <button type="button" onClick={() => handleDelete(brand.id)} className="rounded p-1.5 text-red-500 hover:bg-muted">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      )}
    </CmsShell>
  );
}
