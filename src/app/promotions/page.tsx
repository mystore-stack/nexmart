// src/app/promotions/page.tsx — Promotions Standalone Page
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArrowRight, Sparkles, Gift, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Promotions | NexMart Maroc",
  description: "Découvrez nos promotions exclusives, bundles et offres spéciales premium.",
};

export const dynamic = 'force-dynamic';

export default async function PromotionsPage() {
  const now = new Date();
  
  // Helper function to safely fetch data with fallback
  const safeFetch = async (fn: any, fallback: any): Promise<any> => {
    try {
      return await fn();
    } catch (error) {
      console.warn('Data fetch failed, using fallback:', error);
      return fallback;
    }
  };

  const promos = await safeFetch(() => prisma.homePromoCard.findMany({
    where: {
      active: true,
      OR: [
        { startDate: null }, 
        { startDate: { lte: now } }
      ],
      AND: [
        { 
          OR: [
            { endDate: null }, 
            { endDate: { gte: now } }
          ] 
        }
      ],
    },
    orderBy: { order: "asc" },
  }), []);

  console.log("[PROMOTIONS PAGE] HomePromoCard count:", promos.length);

  // Also fetch from the promotion section if HomePromoCard is empty
  const promotionSection = await safeFetch(() => prisma.homePageSection.findFirst({
    where: {
      sectionKey: "promotion",
    },
    include: {
      products: {
        include: {
          product: true,
        },
        orderBy: { order: "asc" },
      },
    },
  }), null);

  console.log("[PROMOTIONS PAGE] Promotion section:", promotionSection?.id, "Products:", promotionSection?.products?.length);
  
  const mysteryBoxes = await safeFetch(() => prisma.mysteryBoxConfig.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  }), []);
  
  const bundleConfig = await safeFetch(() => prisma.bundleConfig.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  }), null);

  return (
    <div className="min-h-screen bg-background pb-16 space-y-10">
      <PageHeader
        title="Promotions"
        description="Parcourez nos offres spéciales, bundles premium et découvertes exclusives pour NexMart Maroc."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Promotions" },
        ]}
      />

      <section className="container-main">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-violet-900 to-purple-950 p-8 text-white shadow-luxury border border-white/10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                <Sparkles className="h-4 w-4" /> Offres Premium
              </div>
              <h2 className="font-display text-4xl font-extrabold tracking-tight">Promotions en cours</h2>
              <p className="max-w-2xl text-sm text-white/80 leading-relaxed">
                Retrouvez tous nos packs, ventes flash, réductions et sélections exclusives au même endroit. Ne manquez aucune offre haut de gamme imaginée pour le Maroc.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/bundle-builder" className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15">
                  Construire un bundle
                </Link>
                <Link href="/mystery-boxes" className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15">
                  Boîtes mystères
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl bg-card p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Tendances du moment</p>
                  <h3 className="mt-2 text-2xl font-semibold text-foreground">Économisez plus</h3>
                </div>
                <div className="rounded-2xl bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-700">Jusqu'à -30%</div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Accédez aux promotions filtrées et aux meilleures offres premium pour des achats malins et élégants.
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden border border-border shadow-sm">
              <Image
                src="/images/promo_flash_sale.jpg"
                alt="Promotions NexMart"
                width={1200}
                height={800}
                className="h-56 w-full object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority={false}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container-main space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Cartes Promotionnelles</p>
            <h2 className="font-display text-3xl font-semibold text-foreground">Promotions actives</h2>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Ces cartes sont pilotées par la configuration CMS de NexMart et mises à jour automatiquement par l’équipe marketing.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {promotionSection && promotionSection.products && promotionSection.products.length > 0 ? (
            // Display promotion section products
            promotionSection.products.map((sp: any) => {
              const product = sp.product;
              const customPrice = sp.customPrice;
              const originalPrice = product.price;
              const displayPrice = customPrice || originalPrice;
              const discount = customPrice ? Math.round(((originalPrice - customPrice) / originalPrice) * 100) : 0;

              console.log("[PROMOTIONS PAGE] Rendering product:", product.name, "Custom price:", customPrice, "Discount:", discount);

              return (
                <div key={sp.id} className="group overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-luxury">
                  <div className="relative h-64 w-full overflow-hidden">
                    {product.images && product.images[0] ? (
                      <Image 
                        src={product.images[0]} 
                        alt={product.name} 
                        fill 
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{discount}%
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold text-green-600">
                        {displayPrice.toLocaleString("fr-MA")} DH
                      </span>
                      {customPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {originalPrice.toLocaleString("fr-MA")} DH
                        </span>
                      )}
                    </div>
                    <Link href={`/products/${product.slug}`} className="inline-flex items-center gap-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-800">
                      Voir le produit
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card p-8 text-center text-muted-foreground">
              Aucune promotion active pour le moment. Revenez bientôt pour découvrir les nouvelles offres.
            </div>
          )}
        </div>
      </section>

      {(bundleConfig || mysteryBoxes.length > 0) && (
        <section className="container-main space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Offres complémentaires</p>
              <h2 className="font-display text-3xl font-semibold text-foreground">Bundle & Mystery Boxes</h2>
            </div>
            <Link href="/bundle-builder" className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/80">
              Voir le constructeur de bundle
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {bundleConfig ? (
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Bundle</p>
                    <h3 className="text-xl font-bold text-foreground">{bundleConfig.title}</h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground mb-6">{bundleConfig.subtitle}</p>
                <div className="rounded-3xl bg-slate-950/5 p-4">
                  <p className="text-sm text-muted-foreground">Réduction maximale jusqu'à {bundleConfig.maxDiscountPercent}%</p>
                  <p className="mt-3 text-sm text-foreground">{bundleConfig.ctaText}</p>
                </div>
              </div>
            ) : null}

            {mysteryBoxes.length > 0 ? (
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mystery Boxes</p>
                    <h3 className="text-xl font-bold text-foreground">Boîtes mystères prêtes à commander</h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground mb-6">Découvrez des surprises haut de gamme, sélectionnées pour offrir une expérience unique au Maroc.</p>
                <ul className="space-y-3">
                  {mysteryBoxes.slice(0, 3).map((box) => (
                    <li key={box.id} className="rounded-2xl bg-surface p-4 border border-border/60">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{box.title}</p>
                          <p className="text-xs text-muted-foreground">À partir de {box.startingPrice.toLocaleString("fr-MA")} DH</p>
                        </div>
                        <Link href={box.link} className="text-xs font-bold text-brand-700">Voir</Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}
