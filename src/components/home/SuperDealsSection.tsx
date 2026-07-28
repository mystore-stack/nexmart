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
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="market-pill mb-2">Limited Time</p>
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Super Deals</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-600">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              LIVE
            </span>
            <Link href="/deals" className="text-sm font-semibold text-slate-600 hover:text-orange-600">
              Voir tout →
            </Link>
          </div>
        </div>
        <div className="market-grid">
          {hasDeals ? deals.slice(0, 4).map((deal) => (
            <Link
              key={deal.id}
              href={`/products/${deal.product.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-orange-300"
            >
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-orange-50 to-slate-100">
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
                <h3 className="text-sm font-semibold line-clamp-2 transition-colors group-hover:text-orange-600">
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
            <p className="col-span-4 py-8 text-center text-sm text-slate-500">Aucune offre disponible pour le moment</p>
          )}
        </div>
      </div>
    </section>
  );
}
