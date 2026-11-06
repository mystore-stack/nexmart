"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  MobileSectionHeader,
  MobileCategoryCard,
  MobileProductCard,
  MobileProductCardSkeleton,
  MobileBannerCarousel,
  MobileChip,
  MobileEmptyState,
  NexPointsBadge,
} from "@/components/mobile";
import { ShoppingBag, Star, Zap, Package, Camera } from "lucide-react";

/**
 * NexMart — Mobile Homepage
 * Phase 1 — Design System
 *
 * Loaded only in app mode via /app route or detection.
 * Uses /api/mobile/cms/home and /api/mobile/homepage data.
 */

interface HomeData {
  banners?: Array<{ id: string; image: string; title?: string; subtitle?: string; href?: string }>;
  categories?: Array<{ id: string; name: string; slug: string; image?: string }>;
  featured?: any[];
  newArrivals?: any[];
  deals?: any[];
}

export function MobileHomepage() {
  const { data: session } = useSession();
  const [data, setData] = useState<HomeData>({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { key: "all",         label: "Tout" },
    { key: "featured",    label: "Vedettes" },
    { key: "new",         label: "Nouveautés" },
    { key: "deals",       label: "Promos" },
    { key: "top-rated",   label: "Mieux notés" },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const [cmsRes, homeRes] = await Promise.all([
          fetch("/api/mobile/cms/home", { credentials: "include" }),
          fetch("/api/mobile/homepage",  { credentials: "include" }),
        ]);
        const cms  = cmsRes.ok  ? await cmsRes.json()  : {};
        const home = homeRes.ok ? await homeRes.json() : {};
        setData({ ...cms, ...home });
      } catch {
        // offline — show cached state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Default banners if none from CMS
  const banners = data.banners?.length
    ? data.banners
    : [
        { id: "1", image: "/images/mobile/hero-banner.jpg", title: "Bienvenue sur NexMart", subtitle: "Le meilleur du shopping marocain" },
        { id: "2", image: "/images/mobile/fashion-banner.jpg", title: "Mode & Style",          subtitle: "Nouvelles collections" },
        { id: "3", image: "/images/mobile/deals-banner.jpg",   title: "Offres du moment",      subtitle: "Jusqu'à -50%" },
      ];

  const categories = data.categories ?? [];
  const featuredProducts = data.featured ?? [];
  const newArrivals     = data.newArrivals ?? [];

  const skeletonRow = (
    <div style={{ display: "flex", gap: "12px", padding: "0 16px", overflowX: "auto" }}>
      {Array.from({ length: 4 }).map((_, i) => <MobileProductCardSkeleton key={i} />)}
    </div>
  );

  return (
    <div className="nm-page-enter" style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}>

      {/* ── Greeting ───────────────────────────────────────────────────── */}
      <div style={{ padding: "16px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "13px", color: "var(--nm-text-tertiary)", fontWeight: 500 }}>
            Bonjour {session?.user?.name ? session.user.name.split(" ")[0] : "👋"}
          </p>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--nm-text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            Découvrez NexMart
          </h1>
        </div>
        {session?.user && (
          <Link href="/account" style={{ textDecoration: "none" }}>
            <NexPointsBadge points={0} size="sm" />
          </Link>
        )}
      </div>

      {/* ── Search Bar & Scanner ─────────────────────────────────────────── */}
      <div style={{ padding: "0 16px 16px", display: "flex", gap: "8px", alignItems: "center" }}>
        <Link href="/search" style={{ textDecoration: "none", flex: 1 }}>
          <div className="nm-search" style={{ pointerEvents: "none" }}>
            <svg className="nm-search__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span style={{ fontSize: "15px", color: "var(--nm-text-tertiary)" }}>Rechercher des produits...</span>
          </div>
        </Link>
        <Link
          href="/scan"
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "var(--nm-surface-dim)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--nm-primary)",
            textDecoration: "none",
            flexShrink: 0,
          }}
          aria-label="NexScan Scanner"
        >
          <Camera size={20} strokeWidth={2} />
        </Link>
      </div>

      {/* ── Hero Banner Carousel ────────────────────────────────────────── */}
      <div style={{ padding: "0 16px 20px" }}>
        <MobileBannerCarousel slides={banners} autoPlayMs={4500} />
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", padding: "0 16px 24px" }}>
        {[
          { href: "/orders",    icon: Package,     label: "Commandes",   color: "#19C79C", bg: "#E8FDF7" },
          { href: "/account",   icon: Star,        label: "NexPoints",   color: "#D4AF37", bg: "#FFF8DC" },
          { href: "/explore",   icon: Zap,         label: "Découvrir",   color: "#0B6B57", bg: "#E8F4F1" },
          { href: "/wishlist",  icon: ShoppingBag, label: "Favoris",     color: "#EF4444", bg: "#FEE2E2" },
        ].map(({ href, icon: Icon, label, color, bg }) => (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "16px",
                background: bg, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={22} color={color} strokeWidth={1.8} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--nm-text-secondary)", textAlign: "center" }}>
                {label}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Categories ─────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section style={{ marginBottom: "24px" }}>
          <MobileSectionHeader title="Catégories" linkHref="/categories" />
          <div className="nm-scroll-x">
            {categories.slice(0, 10).map((cat) => (
              <MobileCategoryCard key={cat.id} {...cat} />
            ))}
          </div>
        </section>
      )}

      {/* ── Filter Chips ────────────────────────────────────────────────── */}
      <div className="nm-scroll-x" style={{ marginBottom: "16px", paddingBottom: "0" }}>
        {filters.map((f) => (
          <MobileChip
            key={f.key}
            label={f.label}
            active={activeFilter === f.key}
            onClick={() => setActiveFilter(f.key)}
          />
        ))}
      </div>

      {/* ── Featured Products ───────────────────────────────────────────── */}
      <section style={{ marginBottom: "28px" }}>
        <MobileSectionHeader title="Produits vedettes" linkHref="/products?featured=true" />
        {loading ? skeletonRow : (
          featuredProducts.length > 0 ? (
            <div className="nm-scroll-x">
              {featuredProducts.map((p: any) => (
                <MobileProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <MobileEmptyState
              title="Aucun produit vedette"
              description="Revenez bientôt pour découvrir nos sélections"
              actionLabel="Explorer tout"
              actionHref="/products"
            />
          )
        )}
      </section>

      {/* ── New Arrivals ────────────────────────────────────────────────── */}
      {(loading || newArrivals.length > 0) && (
        <section style={{ marginBottom: "28px" }}>
          <MobileSectionHeader title="Nouveautés" linkHref="/products?sort=newest" />
          {loading ? skeletonRow : (
            <div className="nm-scroll-x">
              {newArrivals.map((p: any) => (
                <MobileProductCard key={p.id} product={p} size="sm" />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── NexPoints Promo Banner ───────────────────────────────────────── */}
      <div style={{ margin: "0 16px 28px" }}>
        <Link href="/account" style={{ textDecoration: "none" }}>
          <div style={{
            background: "linear-gradient(135deg, #084C3E 0%, #0B6B57 50%, #0A7D63 100%)",
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}>
            <div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 500, marginBottom: "4px" }}>
                Programme fidélité
              </p>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>
                NexPoints 🏆
              </h3>
              <p style={{ fontSize: "13px", color: "#C8F169", fontWeight: 500, margin: 0 }}>
                Gagnez des points à chaque achat
              </p>
            </div>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: "rgba(200,241,105,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Star size={30} color="#C8F169" fill="#C8F169" strokeWidth={0} />
            </div>
          </div>
        </Link>
      </div>

    </div>
  );
}
