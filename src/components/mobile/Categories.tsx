// src/components/mobile/Categories.tsx
import { cn } from "@/utils/cn";

// ─── Smart Categories (2×2 mood grid) ────────────────────────────────────────

export interface SmartCategory {
  id: string;
  icon: string;
  label: string;
  href?: string;
}

interface SmartCategoriesProps {
  items: SmartCategory[];
  className?: string;
}

export function SmartCategories({ items, className }: SmartCategoriesProps) {
  return (
    <section className={cn("px-4", className)}>
      <SectionHeader title="Browse" />

      <div className="grid grid-cols-2 gap-3">
        {items.map((cat) => (
          <a
            key={cat.id}
            href={cat.href ?? `/categories/${cat.id}`}
            className={cn(
              "card-luxury flex flex-col items-start gap-3 rounded-2xl p-4",
              "active:scale-[0.97] transition-transform duration-150"
            )}
          >
            <span className="text-2xl leading-none" aria-hidden="true">
              {cat.icon}
            </span>
            <span className="text-sm font-semibold text-foreground">{cat.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── Visual Category Grid ─────────────────────────────────────────────────────

export interface VisualCategory {
  id: string;
  label: string;
  imageUrl: string;
  href?: string;
}

interface CategoryGridProps {
  items: VisualCategory[];
  className?: string;
}

export function CategoryGrid({ items, className }: CategoryGridProps) {
  return (
    <section className={cn("px-4", className)}>
      <SectionHeader title="Categories" />

      <div className="grid grid-cols-2 gap-3">
        {items.map((cat) => (
          <a
            key={cat.id}
            href={cat.href ?? `/categories/${cat.id}`}
            className="group relative overflow-hidden rounded-2xl bg-neutral-100"
            style={{ aspectRatio: "1" }}
          >
            <img
              src={cat.imageUrl}
              alt={cat.label}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Label bar — minimal white strip at bottom */}
            <div className="absolute inset-x-0 bottom-0 bg-white/90 py-2 px-3 backdrop-blur-sm">
              <span className="text-xs font-semibold text-foreground">{cat.label}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── Shared section header ────────────────────────────────────────────────────

function SectionHeader({ title, linkLabel = "See all", linkHref = "#" }: {
  title: string;
  linkLabel?: string;
  linkHref?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <a href={linkHref} className="text-xs font-semibold text-[#0F766E]">
        {linkLabel} →
      </a>
    </div>
  );
}
