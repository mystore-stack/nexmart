"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { Edit, Image as ImageIcon, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function CategoriesEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState(parsedConfig || {});
  const [categories, setCategories] = useState<any[]>([]);

  // Fetch categories from database
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          // Flatten categories to include both parent and child categories
          const allCategories: any[] = [];
          data.data.forEach((parent: any) => {
            allCategories.push(parent);
            if (parent.children && parent.children.length > 0) {
              parent.children.forEach((child: any) => {
                allCategories.push(child);
              });
            }
          });
          setCategories(allCategories);
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      await updateSectionConfig(section.id, config);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Categories Display Settings</h3>
      
      <div className="bg-card p-6 rounded-2xl border space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Note: This section automatically pulls the top active categories from your store. 
          You can configure how they are displayed here.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Max Categories to Show</label>
            <input 
              type="number" 
              value={config.limit || 8} 
              onChange={(e) => setConfig({ ...config, limit: parseInt(e.target.value) })}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input 
              type="checkbox" 
              checked={config.showCount ?? true} 
              onChange={(e) => setConfig({ ...config, showCount: e.target.checked })}
              id="showCount"
            />
            <label htmlFor="showCount" className="text-sm font-medium cursor-pointer">
              Show product count badge
            </label>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">Categories Display</h4>
            <p className="text-sm text-muted-foreground">
              Categories are pulled from <span className="font-medium text-amber-600">/admin/categories</span>. Edit images there.
            </p>
          </div>
          <Link
            href="/admin/categories"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-lg text-sm font-medium transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Categories</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 12).map((category) => (
            <div key={category.id} className="border rounded-lg p-4 space-y-3">
              <div className="font-medium text-sm">{category.name}</div>
              
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground text-center">
                {category._count?.products || 0} products
              </div>

              <Link
                href={`/admin/cms/categories/${category.id}`}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-lg text-xs font-medium transition-colors"
              >
                <Edit className="w-3 h-3" />
                <span>Edit Category Page</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
