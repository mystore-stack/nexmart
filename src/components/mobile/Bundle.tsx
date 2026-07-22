// src/components/mobile/Bundle.tsx
import { cn } from "@/utils/cn";

export interface BundleItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface BundleProps {
  items: BundleItem[];
  /** Price after bundle discount */
  bundlePrice: number;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

/**
 * Bundle Deals — horizontal product chain + single CTA.
 * No discount theatre, just the bundle price and a clear action.
 */
export function Bundle({
  items,
  bundlePrice,
  ctaLabel = "Buy Bundle",
  ctaHref = "/bundles",
  className,
}: BundleProps) {
  return (
    <section className={cn("px-4", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Bundle</h2>
        <span className="text-xs font-semibold text-[#D4AF37]">Save more</span>
      </div>

      <div className="card-luxury rounded-2xl p-5">
        {/* Product chain */}
        <div className="flex items-center gap-2 mb-5">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2 flex-1 min-w-0">
              {/* Thumbnail */}
              <div
                className="flex-1 min-w-0 overflow-hidden rounded-xl bg-neutral-50"
                style={{ aspectRatio: "1" }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Plus separator */}
              {index < items.length - 1 && (
                <span className="flex-shrink-0 text-sm font-light text-neutral-400">+</span>
              )}
            </div>
          ))}
        </div>

        {/* Item names */}
        <div className="flex gap-2 mb-5">
          {items.map((item) => (
            <p key={item.id} className="flex-1 text-center text-[10px] text-neutral-500 truncate">
              {item.name}
            </p>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-4" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] text-neutral-400 mb-0.5">Bundle price</p>
            <p className="text-lg font-semibold text-foreground">
              {bundlePrice.toLocaleString("fr-MA")} MAD
            </p>
          </div>
        </div>

        <a href={ctaHref} className="btn btn-primary btn-md w-full justify-center text-sm">
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
