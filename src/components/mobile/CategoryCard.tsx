// src/components/mobile/CategoryCard.tsx
import Link from "next/link";
import { cn } from "@/utils/cn";
import type { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
  className?: string;
  variant?: "icon" | "image";
}

/**
 * Category card — supports two variants: icon-based (smart cats) or image-based (visual grid).
 */
export function CategoryCard({ category, className, variant = "image" }: CategoryCardProps) {
  if (variant === "icon") {
    return (
      <Link
        href={`/m/categories/${category.slug}`}
        className={cn(
          "card-luxury flex flex-col items-start gap-3 rounded-2xl p-4",
          "active:scale-[0.97] transition-transform duration-150",
          className
        )}
      >
        <span className="text-2xl leading-none" aria-hidden="true">
          {category.image || "📦"}
        </span>
        <div>
          <span className="text-sm font-semibold text-foreground block">{category.name}</span>
          {category._count && (
            <span className="text-[10px] text-muted-foreground">
              {category._count.products} items
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/m/categories/${category.slug}`}
      className={cn("group relative overflow-hidden rounded-2xl bg-neutral-100", className)}
      style={{ aspectRatio: "1" }}
    >
      {category.image ? (
        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-6xl text-neutral-300">
          📦
        </div>
      )}
      {/* Label bar */}
      <div className="absolute inset-x-0 bottom-0 bg-white/90 py-2 px-3 backdrop-blur-sm">
        <span className="text-xs font-semibold text-foreground">{category.name}</span>
        {category._count && (
          <span className="text-[10px] text-muted-foreground ml-2">
            {category._count.products}
          </span>
        )}
      </div>
    </Link>
  );
}
