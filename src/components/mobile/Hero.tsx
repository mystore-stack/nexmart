// src/components/mobile/Hero.tsx
import { cn } from "@/utils/cn";

interface HeroProps {
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref?: string;
  imageUrl: string;
  imageAlt?: string;
  className?: string;
}

export function Hero({
  title,
  subtitle,
  ctaLabel,
  ctaHref = "/products",
  imageUrl,
  imageAlt = "",
  className,
}: HeroProps) {
  return (
    <section className={cn("px-4 pt-4", className)}>
      {/* Image */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-100" style={{ aspectRatio: "4/3" }}>
        <img
          src={imageUrl}
          alt={imageAlt}
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Text */}
      <div className="mt-5 space-y-2">
        {subtitle && (
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            {subtitle}
          </p>
        )}
        <h1 className="font-display text-3xl font-semibold leading-tight text-foreground">
          {title}
        </h1>
      </div>

      {/* CTA */}
      <div className="mt-5">
        <a href={ctaHref} className="btn btn-primary btn-md inline-flex w-full justify-center text-sm">
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
