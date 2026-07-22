// src/components/mobile/MysteryBox.tsx
import { cn } from "@/utils/cn";

interface MysteryBoxProps {
  title?: string;
  description?: string;
  valueLabel?: string;
  ctaLabel?: string;
  ctaHref?: string;
  scarcityLabel?: string;
  className?: string;
}

/**
 * Mystery Box — minimal dark card.
 * No emoji overload, no animations, no glow blobs.
 * Just text, hierarchy, and one action.
 */
export function MysteryBox({
  title = "Mystery Box",
  description = "Curated premium products, selected by our team.",
  valueLabel = "Worth up to 500 MAD",
  ctaLabel = "Open Your Box",
  ctaHref = "/mystery-box",
  scarcityLabel = "Only 20 remaining",
  className,
}: MysteryBoxProps) {
  return (
    <section className={cn("px-4", className)}>
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: "#0F172A" }}
      >
        {/* Scarcity — just a small text line, no badge theatre */}
        {scarcityLabel && (
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
            {scarcityLabel}
          </p>
        )}

        {/* Title */}
        <h2
          className="font-display text-3xl font-semibold leading-tight mb-2"
          style={{ color: "#D4AF37" }}
        >
          {title}
        </h2>

        {/* Value */}
        <p className="text-sm font-semibold text-white mb-2">{valueLabel}</p>

        {/* Description */}
        <p className="text-sm text-neutral-400 leading-relaxed mb-6">
          {description}
        </p>

        {/* CTA */}
        <a href={ctaHref} className="btn btn-gold btn-md inline-flex w-full justify-center text-sm">
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
