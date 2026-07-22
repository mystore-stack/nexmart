// src/components/home/SuperDealsSection.tsx
import { Deal } from "@/types";
import Link from "next/link";
import Image from "next/image";

interface SuperDealsSectionProps {
  deals: Deal[];
}

export function SuperDealsSection({ deals }: SuperDealsSectionProps) {
  // Force render for debugging
  const hasDeals = deals && deals.length > 0;

  return (
    <section className="section">
      <div className="container-main">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Limited Time</p>
            <h2 className="font-display text-2xl font-semibold text-foreground">Super Deals</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-sm font-bold text-red-500">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </span>
            <Link href="/m/deals" className="text-sm font-semibold text-primary hover:underline">
              See all →
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {hasDeals ? deals.slice(0, 4).map((deal) => (
            <Link
              key={deal.id}
              href={`/products/${deal.product.slug}`}
              className="group relative bg-white dark:bg-card rounded-2xl overflow-hidden border border-gold-200/30 hover:border-gold-400/50 transition-all"
            >
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-moroccan-sand to-muted/50">
                <Image
                  src={deal.product.images[0] || "/placeholder.jpg"}
                  alt={deal.product.name}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                />
                {deal.discountPercentage > 0 && (
                  <span className="absolute top-3 left-3 badge badge-sale text-[10px] font-black">
                    -{deal.discountPercentage}%
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-brand-700 transition-colors">
                  {deal.product.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-foreground">{deal.product.price.toLocaleString("fr-MA")} MAD</span>
                  {deal.product.comparePrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {deal.product.comparePrice.toLocaleString("fr-MA")} MAD
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )) : (
            <p className="text-muted-foreground text-center py-8 col-span-4">No deals available at the moment</p>
          )}
        </div>
      </div>
    </section>
  );
}
