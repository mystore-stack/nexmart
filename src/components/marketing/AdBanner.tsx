"use client";

import type { AdvertisementDTO } from "@/lib/marketing/types";
import { AD_PLACEMENT_LABELS } from "@/lib/marketing/types";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AdvertisementPreview({ ad }: { ad: Partial<AdvertisementDTO> }) {
  const bg = ad.backgroundColor ?? "#0F766E";
  const fg = ad.textColor ?? "#FFFFFF";

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-8 min-h-[200px] flex flex-col justify-center"
      style={{ backgroundColor: bg, color: fg }}
    >
      {ad.imageDesktop && (
        <div className="absolute inset-0 opacity-30">
          <Image src={ad.imageDesktop} alt="" fill className="object-cover" sizes="800px" />
        </div>
      )}
      <div className="relative z-10 max-w-lg">
        {ad.subtitle && (
          <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">{ad.subtitle}</p>
        )}
        <h3 className="font-display text-2xl font-bold mb-2">{ad.title || "Advertisement Title"}</h3>
        {ad.description && <p className="text-sm opacity-80 mb-4 line-clamp-2">{ad.description}</p>}
        {ad.ctaText && (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
            {ad.ctaText}
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="absolute bottom-2 right-3 text-[10px] opacity-50">
        {ad.placement ? AD_PLACEMENT_LABELS[ad.placement] : "Preview"}
      </p>
    </div>
  );
}

export function AdBanner({ ad, onTrack }: { ad: AdvertisementDTO; onTrack?: (type: "view" | "click") => void }) {
  const content = (
    <div
      className="relative overflow-hidden rounded-2xl p-6 md:p-10 min-h-[160px] flex flex-col justify-center transition-transform hover:scale-[1.01]"
      style={{ backgroundColor: ad.backgroundColor, color: ad.textColor }}
      onMouseEnter={() => onTrack?.("view")}
    >
      {ad.imageDesktop && (
        <div className="absolute inset-0 hidden md:block opacity-25">
          <Image src={ad.imageDesktop} alt="" fill className="object-cover" sizes="1200px" loading="lazy" />
        </div>
      )}
      {ad.imageMobile && (
        <div className="absolute inset-0 md:hidden opacity-25">
          <Image src={ad.imageMobile} alt="" fill className="object-cover" sizes="600px" loading="lazy" />
        </div>
      )}
      <div className="relative z-10">
        {ad.subtitle && <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{ad.subtitle}</p>}
        <h2 className="font-display text-xl md:text-3xl font-bold">{ad.title}</h2>
        {ad.description && <p className="mt-2 text-sm opacity-80 max-w-xl">{ad.description}</p>}
        {ad.ctaText && (
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold">
            {ad.ctaText}
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );

  if (ad.ctaUrl) {
    return (
      <Link href={ad.ctaUrl} onClick={() => onTrack?.("click")} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
