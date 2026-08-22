"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, Sparkles, Star } from "lucide-react";
import type { PromoBannerPayload } from "@/lib/promo-banner";
import { formatCurrency, getProductImage, normalizeThemeColors } from "@/lib/promo-banner";

const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80";

export function MegaPromoBannerSection() {
  const [data, setData] = useState<PromoBannerPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/homepage/mega-promo")
      .then((res) => res.json())
      .then((payload) => {
        if (isMounted && payload.success && payload.data) {
          setData(payload.data);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const theme = useMemo(() => normalizeThemeColors((data?.section.description as string | null) || null), [data]);

  if (loading) {
    return (
      <section className="container-main my-8">
        <div className="animate-pulse overflow-hidden rounded-[2.2rem] border border-border bg-card shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div className="space-y-4">
              <div className="h-8 w-32 rounded-full bg-muted" />
              <div className="h-12 w-4/5 rounded-2xl bg-muted" />
              <div className="h-4 w-3/4 rounded-full bg-muted" />
              <div className="h-12 w-36 rounded-2xl bg-muted" />
            </div>
            <div className="h-[320px] rounded-[1.8rem] bg-muted" />
          </div>
        </div>
      </section>
    );
  }

  // Return null if section is inactive or no data
  if (!data || (data.section && !data.section.active)) {
    return null;
  }

  const bannerImage = data.section.bannerImage || data.promo.image || DEFAULT_PRODUCT_IMAGE;
  const products = data.products ? data.products.slice(0, 6) : [];

  return (
    <section className="container-main my-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-[2.2rem] border border-white/20 bg-gradient-to-br shadow-[0_24px_90px_rgba(15,23,42,0.14)]"
        style={{
          backgroundImage: `linear-gradient(135deg, ${theme.surface} 0%, rgba(255,255,255,0.06) 35%, rgba(255,255,255,0.02) 100%), linear-gradient(135deg, ${theme.background})`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_45%)]" />
        <div className="relative grid gap-8 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/90 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                {data.promo.badgeText || "Mega promo"}
              </div>
              <div className="space-y-3">
                <h2 className="max-w-2xl font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  {data.promo.title}
                </h2>
                <p className="max-w-xl text-sm leading-7 text-white/80 sm:text-base">
                  {data.promo.subtitle || "Des produits premium triés pour des prix qui ont du sens."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={data.section.destinationUrl || data.promo.link || "/products"}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:scale-[1.01]"
                >
                  {data.promo.ctaText || "Découvrir l’offre"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-medium text-white/85 backdrop-blur-sm">
                  <Clock3 className="h-4 w-4" />
                  {data.countdown.isExpired ? "Offre clôturée" : `${data.countdown.days}j ${data.countdown.hours}h ${data.countdown.minutes}m`}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.3rem] border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/70">Remise</p>
                <p className="mt-1 text-xl font-semibold text-white">{data.promo.discountPills?.[0] || "-45%"}</p>
              </div>
              <div className="rounded-[1.3rem] border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/70">Livraison</p>
                <p className="mt-1 text-xl font-semibold text-white">24h</p>
              </div>
              <div className="rounded-[1.3rem] border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/70">Sélection</p>
                <p className="mt-1 text-xl font-semibold text-white">{products.length} produits</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.9rem] border border-white/15 bg-white/10 p-3 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
            <div className="relative h-full min-h-[360px] overflow-hidden rounded-[1.5rem]">
              <Image
                src={bannerImage}
                alt={data.promo.title}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="rounded-[1.2rem] border border-white/15 bg-slate-950/45 p-4 text-white backdrop-blur-md">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/70">Sélection premium</p>
                  <p className="mt-1 text-lg font-semibold">Des prix impeccables sur des produits choisis par le marketing premium.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-slate-950/20 px-6 py-5 backdrop-blur-sm">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/85 shadow-sm"
              >
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={product.image || getProductImage({}, index) || DEFAULT_PRODUCT_IMAGE}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-slate-900/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                    {product.discountBadge || "-20%"}
                  </span>
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} className="h-3.5 w-3.5 fill-current" />
                    ))}
                    <span className="ml-1 text-[11px] font-medium text-slate-600">{product.rating.toFixed(1)}</span>
                  </div>
                  <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</h3>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-slate-500 line-through">{formatCurrency(product.oldPrice)}</p>
                      <p className="text-base font-semibold text-slate-900">{formatCurrency(product.currentPrice)}</p>
                    </div>
                    <Link href={`/products/${product.slug}`} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950">
                      Voir
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
