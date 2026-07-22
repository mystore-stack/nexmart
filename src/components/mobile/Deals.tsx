// src/components/mobile/Deals.tsx
import { cn } from "@/utils/cn";

export interface Deal {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  href?: string;
}

interface DealsProps {
  deals: Deal[];
  className?: string;
}

/**
 * Super Deals — simplified horizontal scroll.
 * Each card: image · name · price · "Limited" label.
 * No countdowns, no progress bars, no urgency theatre.
 */
export function Deals({ deals, className }: DealsProps) {
  return (
    <section className={cn("", className)}>
      <div className="mb-4 flex items-center justify-between px-4">
        <h2 className="font-display text-xl font-semibold text-foreground">Deals</h2>
        <a href="/deals" className="text-xs font-semibold text-[#0F766E]">
          See all →
        </a>
      </div>

      {/* Horizontal scroll strip */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </section>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  return (
    <a
      href={deal.href ?? `/products/${deal.id}`}
      className={cn(
        "card-luxury flex-shrink-0 w-[160px] overflow-hidden rounded-2xl",
        "flex flex-col"
      )}
    >
      {/* Image */}
      <div className="w-full bg-neutral-50 overflow-hidden" style={{ aspectRatio: "1" }}>
        <img
          src={deal.imageUrl}
          alt={deal.name}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="truncate text-[12px] font-medium text-foreground mb-1">{deal.name}</p>
        <p className="text-sm font-semibold text-foreground">
          {deal.price.toLocaleString("fr-MA")} MAD
        </p>
        {/* Single clean "Limited" label — no fake urgency */}
        <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wider text-[#D4AF37]">
          Limited
        </span>
      </div>
    </a>
  );
}
