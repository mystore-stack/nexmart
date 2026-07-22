// src/components/mobile/FeaturedProducts.tsx
import { cn } from "@/utils/cn";

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  href?: string;
}

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  className?: string;
}

export function FeaturedProducts({
  products,
  title = "Featured",
  className,
}: FeaturedProductsProps) {
  return (
    <section className={cn("px-4", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
        <a href="/products" className="text-xs font-semibold text-[#0F766E]">
          View all →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

// ─── Single card — image · name · price only ──────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  return (
    <a
      href={product.href ?? `/products/${product.id}`}
      className="product-card group flex flex-col"
    >
      {/* Image */}
      <div
        className="w-full overflow-hidden rounded-xl bg-neutral-50"
        style={{ aspectRatio: "3/4" }}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Info — only name + price */}
      <div className="p-3 pb-4">
        <p className="truncate text-[13px] font-medium text-foreground">{product.name}</p>
        <p className="mt-1 text-sm font-semibold text-foreground">
          {product.price.toLocaleString("fr-MA")} MAD
        </p>
      </div>
    </a>
  );
}
