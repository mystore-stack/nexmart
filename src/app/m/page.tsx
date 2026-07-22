// src/app/m/page.tsx — Mobile Home (Real Data + Mobile-Optimized Layout)
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { ProductCard } from "@/components/mobile/ProductCard";
import { CategoryCard } from "@/components/mobile/CategoryCard";
import { DealCard } from "@/components/mobile/DealCard";
import { NewsletterSignup } from "@/components/mobile/NewsletterSignup";
import {
  getMobileFeaturedProducts,
  getMobileCategories,
  getMobileDeals,
  getMobileBundles,
  getMobileMysteryBoxes,
} from "@/lib/mobile-data";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Home" };
export const revalidate = 300;

export default async function MobileHomePage() {
  const [featured, categories, deals, bundles, boxes] = await Promise.all([
    getMobileFeaturedProducts(),
    getMobileCategories(),
    getMobileDeals(),
    getMobileBundles(),
    getMobileMysteryBoxes(),
  ]);

  const bundle = bundles.length > 0 ? bundles[0] : null;
  const box = boxes.length > 0 ? boxes[0] : null;

  return (
    <MobileLayout>
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <span className="font-display text-xl font-bold text-foreground tracking-tight">NexMart</span>
        <div className="flex items-center gap-3">
          <Link href="/m/search" aria-label="Search" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
          <Link href="/m/cart" aria-label="Cart" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-10 py-6">

        {/* ── 1. FLASH SALE BANNER ── */}
        <section className="px-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-red-700 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/80 mb-1">⚡ Limited Time</p>
                  <h2 className="text-2xl font-bold text-white">Flash Sale</h2>
                </div>
                <span className="text-3xl font-bold text-white/90">-50%</span>
              </div>
              <p className="text-sm text-white/80 mb-4">Limited quantity, first come first served</p>
              <Link href="/m/deals" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-semibold text-sm hover:bg-neutral-50 transition-colors">
                See Flash Deals →
              </Link>
            </div>
          </div>
        </section>

        {/* ── 2. Hero banner ── */}
        <section className="px-4">
          <div className="relative overflow-hidden rounded-2xl bg-neutral-100" style={{ aspectRatio: "4/3" }}>
            <img
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80"
              alt="New Collection"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">New Collection</p>
              <h1 className="font-display text-3xl font-semibold text-white leading-tight mb-4">
                Dress the<br />Moment.
              </h1>
              <Link href="/m/products" className="btn btn-gold btn-sm inline-flex text-sm font-bold">
                Shop Now →
              </Link>
            </div>
          </div>
        </section>

        {/* ── 3. Smart categories ── */}
        <section className="px-4">
          <SectionHeader title="Browse" linkHref="/m/categories" />
          <div className="grid grid-cols-3 gap-2">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/m/categories/${cat.slug}`}
                className="card-luxury flex flex-col items-center gap-2 rounded-2xl p-3 text-center active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                  {CAT_ICON[cat.slug] || "📦"}
                </div>
                <span className="text-[11px] font-semibold text-foreground leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 4. Super Deals preview ── */}
        {deals.length > 0 && (
          <section>
            <div className="flex items-center justify-between px-4 mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Limited Time</p>
                <h2 className="font-display text-xl font-semibold text-foreground">Super Deals</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </span>
                <Link href="/m/deals" className="text-xs font-semibold text-primary">See all →</Link>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
              {deals.slice(0, 4).map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </section>
        )}

        {/* ── 5. Bundle preview ── */}
        {bundle && (
          <section className="px-4">
            <SectionHeader title="Bundle Deals" subtitle="Save more" linkHref="/m/bundles" />
            <div className="card-luxury rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                {bundle.products.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-1 overflow-hidden rounded-xl bg-muted aspect-square">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    {i < bundle.products.length - 1 && (
                      <span className="text-sm font-light text-muted-foreground">+</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{bundle.name}</p>
                  <p className="text-lg font-bold text-foreground">{bundle.bundlePrice.toLocaleString("fr-MA")} MAD</p>
                  <p className="text-xs text-muted-foreground line-through">{bundle.totalPrice.toLocaleString("fr-MA")} MAD</p>
                </div>
                <Link href={`/m/bundles/${bundle.slug}`} className="btn btn-primary btn-sm text-sm">
                  Save {bundle.discountPercentage}%
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── 6. Mystery Box ── */}
        {box && (
          <section className="px-4">
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#0F172A" }}>
              {box.stock <= 20 && (
                <div className="flex items-center gap-1.5 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-red-400">
                    Only {box.stock} left
                  </span>
                </div>
              )}
              <h2 className="font-display text-3xl font-semibold leading-tight mb-1" style={{ color: "#D4AF37" }}>
                {box.name}
              </h2>
              <p className="text-sm font-semibold text-white mb-1">{box.valueLabel}</p>
              <p className="text-sm text-neutral-400 leading-relaxed mb-5">{box.description}</p>
              <Link href="/m/mystery-box" className="btn btn-gold btn-md w-full justify-center inline-flex text-sm">
                Open Your Box →
              </Link>
            </div>
          </section>
        )}

        {/* ── 7. Featured products ── */}
        <section className="px-4">
          <SectionHeader title="Featured" linkHref="/m/products" />
          <div className="grid grid-cols-2 gap-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ── 8. Trending products ── */}
        <section className="px-4">
          <SectionHeader title="Trending Now" subtitle="What's hot" linkHref="/m/products" />
          <div className="grid grid-cols-2 gap-3">
            {featured.slice(0, 4).map((p) => (
              <ProductCard key={`trending-${p.id}`} product={p} />
            ))}
          </div>
        </section>

        {/* ── 9. Promo Banner ── */}
        <section className="px-4">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/m/categories/fashion" className="relative overflow-hidden rounded-2xl aspect-square group">
              <img
                src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&q=80"
                alt="Fashion"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center">
                <p className="text-white font-bold text-lg text-center px-2">Fashion</p>
                <p className="text-white/80 text-xs mt-1">New Arrivals</p>
              </div>
            </Link>
            <Link href="/m/categories/beauty" className="relative overflow-hidden rounded-2xl aspect-square group">
              <img
                src="https://images.unsplash.com/photo-1596462502278-af807e74ae67?w=400&q=80"
                alt="Beauty"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center">
                <p className="text-white font-bold text-lg text-center px-2">Beauty</p>
                <p className="text-white/80 text-xs mt-1">Premium Range</p>
              </div>
            </Link>
          </div>
        </section>

        {/* ── 10. Recently Viewed (placeholder) ── */}
        <section className="px-4">
          <SectionHeader title="Recently Viewed" linkHref="/m/products" />
          <div className="grid grid-cols-2 gap-3">
            {featured.slice(2, 6).map((p) => (
              <ProductCard key={`viewed-${p.id}`} product={p} />
            ))}
          </div>
        </section>

        {/* ── 11. Why NexMart ── */}
        <section className="px-4 py-8">
          <div className="grid gap-4">
            <div className="card-luxury rounded-xl p-4">
              <div className="text-2xl mb-2">🚚</div>
              <h3 className="font-semibold text-foreground mb-1">Express Delivery</h3>
              <p className="text-xs text-muted-foreground">Get your order in 24-48 hours across Morocco</p>
            </div>
            <div className="card-luxury rounded-xl p-4">
              <div className="text-2xl mb-2">🛡️</div>
              <h3 className="font-semibold text-foreground mb-1">Secure Checkout</h3>
              <p className="text-xs text-muted-foreground">SSL encrypted • Stripe & CMI payments</p>
            </div>
            <div className="card-luxury rounded-xl p-4">
              <div className="text-2xl mb-2">💎</div>
              <h3 className="font-semibold text-foreground mb-1">Curated Selection</h3>
              <p className="text-xs text-muted-foreground">Handpicked Moroccan luxury & authentic products</p>
            </div>
            <div className="card-luxury rounded-xl p-4">
              <div className="text-2xl mb-2">📱</div>
              <h3 className="font-semibold text-foreground mb-1">24/7 Support</h3>
              <p className="text-xs text-muted-foreground">Chat, email, or call us anytime</p>
            </div>
          </div>
        </section>

        {/* ── 12. Newsletter Signup ── */}
        <NewsletterSignup />

      </div>
    </MobileLayout>
  );
}

// Icon map (slug → emoji)
const CAT_ICON: Record<string, string> = {
  electronics: "📱", fashion: "👗", home: "🏡",
  beauty: "💄", sports: "⚽", books: "📚",
};
