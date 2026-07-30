// src/app/bundle-builder/page.tsx — Bundle Builder Standalone Page
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { BundleBuilderSection } from "@/components/home/BundleBuilderSection";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Constructeur de Bundle | NexMart Maroc",
  description: "Créez votre pack premium avec des réductions exclusives et économisez jusqu'à 30%.",
};

export const dynamic = 'force-dynamic';

export default async function BundleBuilderPage() {
  let bundleConfig = null;
  try {
    bundleConfig = await prisma.bundleConfig.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    // BundleConfig table might not exist yet, use defaults
    console.warn('BundleConfig table not found, using defaults');
  }

  return (
    <div className="min-h-screen bg-background pb-16 space-y-10">
      <PageHeader
        title="Constructeur de Bundle"
        description="Assemblez votre pack premium, bénéficiez de remises exclusives et commandez plus intelligemment sur NexMart Maroc."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Constructeur de Bundle" },
        ]}
      />

      <section className="container-main">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 text-white shadow-luxury border border-white/10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80">
                <Layers className="h-4 w-4" /> Pack Personnalisé
              </div>
              <h2 className="font-display text-4xl font-extrabold tracking-tight">Créez le bundle parfait</h2>
              <p className="max-w-2xl text-sm text-white/80 leading-relaxed">
                Choisissez plusieurs produits premium, recevez une remise automatique et profitez d'une expérience d'achat optimisée pour le Maroc.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/products?sort=discount" className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-800">
                  Voir les meilleures offres
                </Link>
                <Link href="/deals" className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Découvrir les promos
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Réduction maximale</p>
                <h3 className="text-xl font-semibold text-foreground">Jusqu'à {bundleConfig?.maxDiscountPercent ?? 30}%</h3>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground mb-6">
              {bundleConfig?.subtitle ?? "Sélectionnez vos produits préférés et bénéficiez de tarifs exclusifs sur votre commande."}
            </p>
            <div className="rounded-3xl bg-surface p-5 border border-border/70">
              <p className="text-sm text-muted-foreground">Action recommandée</p>
              <p className="mt-3 text-lg font-semibold text-foreground">{bundleConfig?.ctaText ?? "Créer mon bundle"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-main">
        <BundleBuilderSection />
      </section>

      <section className="container-main">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Besoin d'inspiration ?</p>
              <h3 className="mt-2 text-3xl font-semibold text-foreground">Explorez des packs premium recommandés</h3>
            </div>
            <Link href="/promotions" className="inline-flex items-center gap-2 rounded-2xl border border-border bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800">
              Voir les promos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
