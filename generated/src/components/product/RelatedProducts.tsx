// src/components/product/RelatedProducts.tsx
import React from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

export function RelatedProducts({ products }: { products: Product[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">You May Also Like</h2>
        <p className="text-muted-foreground text-sm mt-1">Based on this product</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
