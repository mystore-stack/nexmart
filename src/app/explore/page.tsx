import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Compass, Sparkles, Flame, Tag, ShieldCheck, ArrowRight, Package, Award } from "lucide-react";
import { getHomePageData } from "@/lib/home-data";
import { ProductCard } from "@/components/product/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explorer & Découvrir | NexMart Maroc",
  description: "Découvrez les tendances, meilleures ventes, offres exclusives et collections spéciales sur NexMart.",
};

export default async function ExplorePage() {
  const { categories, cms } = await getHomePageData();

  // Extract products from CMS sections
  const flashSaleSection = cms.homeSections?.find((s: any) => s.sectionKey === "flashSale");
  const flashProducts = flashSaleSection?.products?.map((p: any) => p.product || p).filter(Boolean) || [];

  const bestSellersSection = cms.homeSections?.find((s: any) => s.sectionKey === "bestSellers");
  const bestSellers = bestSellersSection?.products?.map((p: any) => p.product || p).filter(Boolean) || [];

  const brands = cms.brandPartners || [];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 space-y-6">
      {/* Top Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 px-4 py-8 text-white overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30 mb-2">
            <Compass className="h-3.5 w-3.5" />
            <span>NexMart Discovery</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Explorez les Meilleures Offres & Tendances
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Produits authentiques sélectionnés par IA avec livraison express au Maroc.
          </p>
        </div>
      </div>

      {/* Category Quick Chips Slider */}
      <section className="px-4">
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="shrink-0 flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-sm active:scale-95 transition-all"
            >
              {cat.image ? (
                <div className="relative h-5 w-5 rounded-full overflow-hidden bg-slate-100">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                </div>
              ) : (
                <Tag className="h-3.5 w-3.5 text-emerald-600" />
              )}
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      {bestSellers.length > 0 && (
        <section className="px-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tendances du Moment</h2>
              <p className="text-xs text-slate-500">Les articles les plus demandés cette semaine</p>
            </div>
            <Link href="/products" className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {bestSellers.slice(0, 4).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Special Offer Banner */}
      <section className="px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="max-w-[70%]">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200">
                Offre Spéciale Maroc
              </span>
              <h3 className="text-lg font-extrabold mt-0.5 leading-tight">
                Paiement à la Livraison & Livraison 24-48h
              </h3>
              <p className="text-xs text-emerald-100/90 mt-1">
                Commandez en toute sécurité partout au Maroc.
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Top Brands Carousel */}
      {brands.length > 0 && (
        <section className="px-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Marques Partenaires</h2>
              <p className="text-xs text-slate-500">Produits 100% authentiques garantis</p>
            </div>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
            {brands.map((brand: any) => (
              <div
                key={brand.id || brand.name}
                className="shrink-0 flex flex-col items-center justify-center h-20 w-28 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm"
              >
                {brand.logo ? (
                  <div className="relative h-8 w-full">
                    <Image src={brand.logo} alt={brand.name} fill className="object-contain" />
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-800">{brand.name}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
