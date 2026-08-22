"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { ProductSelector } from "@/components/admin/ProductSelector";

export function ProductCollectionManager({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // section.products contains HomepageSectionProduct entries
  const initialProducts = section.products || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Manage Products</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Search and select products for the {section.title} section. Changes are saved automatically.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <ProductSelector 
          sectionKey={section.sectionKey} 
          maxProducts={parsedConfig?.maxProducts || 12}
          initialProducts={initialProducts}
          onSelectionChange={() => {
            // Revalidate data in background to keep UI fresh if needed
            startTransition(() => {
              router.refresh();
            });
          }}
        />
      </div>
    </div>
  );
}

