"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export function SeasonalCollectionSection({ products = [] }: { products?: any[] }) {
  const heroImage = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80";
  const featured = products.slice(0, 3);

  return (
    <section className="my-4 md:my-6">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
        <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
          <div className="relative min-h-[260px] overflow-hidden bg-slate-900">
            <Image src={heroImage} alt="Collection saisonnière" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/40 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6 md:p-8">
              <div className="max-w-md">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-100">
                  <Sparkles className="h-3 w-3" />
                  Collection saisonnière
                </div>
                <h2 className="font-display text-4xl font-semibold text-white md:text-5xl">Les dernières tendances</h2>
                <p className="mt-2 max-w-sm text-sm text-slate-200">Une sélection premium qui associe confort, modernité et essentiels du quotidien.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 p-5 md:p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">Édition limitée</p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-slate-900">Nouveaux arrivages</h3>
              <p className="mt-2 text-sm text-slate-600">Des pièces pensées pour un style contemporain et des achats plus intelligents.</p>
            </div>

            <div className="space-y-2.5">
              {featured.length ? (
                featured.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-slate-50 p-2.5">
                    <div className="relative h-14 w-14 overflow-hidden rounded-[12px] bg-white">
                      {product.images?.[0] && typeof product.images[0] === "string" && product.images[0].trim() ? (
                        <Image src={product.images[0]} alt={product.name} fill sizes="56px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[11px] font-semibold text-slate-700">{product.name}</p>
                      <p className="mt-1 text-[11px] font-bold text-slate-900">{product.price?.toLocaleString("fr-MA")} DH</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">Aucune sélection disponible.</div>
              )}
            </div>

            <Link href="/products?featured=true" className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
              Explorer la collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

