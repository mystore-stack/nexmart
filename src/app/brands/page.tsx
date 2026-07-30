import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBrandsFromTags } from "@/lib/catalog-queries";
import { Search, Award, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marques | NexMart Maroc",
  description: "Découvrez toutes les marques premium disponibles sur NexMart Maroc. Parcourez notre catalogue par marque et trouvez vos produits préférés.",
  keywords: "marques, brands, NexMart Maroc, shopping, e-commerce",
};

export const revalidate = 600;

export default async function BrandsPage() {
  const brands = await getBrandsFromTags();

  // Sort brands by product count (descending)
  const sortedBrands = [...brands].sort((a, b) => b.count - a.count);

  // Get top brands for featured section
  const topBrands = sortedBrands.slice(0, 6);
  const otherBrands = sortedBrands.slice(6);

  return (
    <div className="page-enter min-h-screen bg-background pb-16 space-y-10">
      <PageHeader
        title="Nos Marques"
        description="Explorez notre sélection de marques premium et découvouvrez les produits les plus prisés du marché marocain."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Marques" },
        ]}
      />

      {/* Featured Brands Section */}
      {topBrands.length > 0 && (
        <section className="container-main">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Marques Vedettes</p>
              <h2 className="text-2xl font-bold text-foreground">Les plus populaires</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topBrands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-luxury transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground capitalize group-hover:text-brand-700 transition-colors">
                      {brand.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{brand.count} produits</p>
                  </div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-muted-foreground group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Top Marque
                  </span>
                  <span className="text-xs font-bold text-brand-700 group-hover:underline">
                    Voir les produits →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Brands Directory */}
      <section className="container-main">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Annuaire</p>
            <h2 className="font-display text-3xl font-semibold text-foreground">Toutes les marques</h2>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Parcourez notre catalogue complet de marques et découvrez des produits de qualité exceptionnelle.
          </p>
        </div>

        {brands.length === 0 ? (
          <div className="bg-card p-12 rounded-3xl border border-border text-center space-y-3">
            <Award className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="font-bold text-foreground">Aucune marque répertoriée pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedBrands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="bg-card border border-border rounded-2xl p-5 text-center hover:border-brand-300 hover:shadow-sm hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 group"
              >
                <span className="font-semibold capitalize block text-foreground group-hover:text-brand-700 transition-colors">
                  {brand.name}
                </span>
                <span className="text-xs text-muted-foreground mt-1 block">{brand.count} produits</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Brand Stats */}
      <section className="container-main">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white border border-white/10">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-4xl font-black text-gold-300">{brands.length}</p>
              <p className="text-sm text-white/70 mt-1">Marques disponibles</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-gold-300">
                {brands.reduce((sum, b) => sum + b.count, 0).toLocaleString("fr-MA")}
              </p>
              <p className="text-sm text-white/70 mt-1">Produits au total</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-gold-300">100%</p>
              <p className="text-sm text-white/70 mt-1">Marques authentiques</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
