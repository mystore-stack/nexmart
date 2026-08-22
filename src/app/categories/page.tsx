import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { CategoryGrid } from "@/components/catalog/CategoryGrid";
import { getCatalogCategories } from "@/lib/catalog-queries";
import { Layers, Grid3x3, TrendingUp, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catégories | NexMart Maroc",
  description: "Explorez toutes les catégories de produits sur NexMart Maroc. Mode, Maison, Tech, Beauté et plus. Trouvez exactement ce que vous cherchez.",
  keywords: "catégories, categories, NexMart Maroc, shopping, e-commerce, mode, tech, maison",
};

export const revalidate = 300;

export default async function CategoriesPage() {
  const categories = await getCatalogCategories();

  // Sort categories by product count (descending)
  const sortedCategories = [...categories].sort((a, b) => (b._count?.products || 0) - (a._count?.products || 0));

  // Get top categories for featured section
  const topCategories = sortedCategories.slice(0, 6);
  const otherCategories = sortedCategories.slice(6);

  return (
    <div className="page-enter min-h-screen bg-background pb-16 space-y-10">
      <PageHeader
        title="Nos Catégories"
        description="Explorez notre univers complet de catégories et découvrez des produits soigneusement sélectionnés pour chaque besoin."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Catégories" },
        ]}
      />

      {/* Featured Categories Section */}
      {topCategories.length > 0 && (
        <section className="container-main">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Catégories Vedettes</p>
              <h2 className="text-2xl font-bold text-foreground">Les plus populaires</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-luxury transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-brand-700 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{category._count?.products || 0} produits</p>
                  </div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-muted-foreground group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Top Catégorie
                  </span>
                  <span className="text-xs font-bold text-brand-700 group-hover:underline">
                    Explorer →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Categories Grid */}
      <section className="container-main">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Catalogue</p>
            <h2 className="font-display text-3xl font-semibold text-foreground">Toutes les catégories</h2>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Parcourez notre catalogue complet et trouvez les produits qui correspondent parfaitement à vos besoins et envies.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="bg-card p-12 rounded-3xl border border-border text-center space-y-3">
            <Layers className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="font-bold text-foreground">Aucune catégorie disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-card border border-border rounded-2xl p-5 text-center hover:border-brand-300 hover:shadow-sm hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 group"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-muted-foreground group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors mb-3">
                  <Grid3x3 className="h-5 w-5" />
                </div>
                <span className="font-semibold block text-foreground group-hover:text-brand-700 transition-colors">
                  {category.name}
                </span>
                <span className="text-xs text-muted-foreground mt-1 block">{category._count?.products || 0} produits</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Category Stats */}
      <section className="container-main">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white border border-white/10">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-4xl font-black text-gold-300">{categories.length}</p>
              <p className="text-sm text-white/70 mt-1">Catégories disponibles</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-gold-300">
                {categories.reduce((sum, c) => sum + (c._count?.products || 0), 0).toLocaleString("fr-MA")}
              </p>
              <p className="text-sm text-white/70 mt-1">Produits au total</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-gold-300">24/7</p>
              <p className="text-sm text-white/70 mt-1">Disponibilité</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
