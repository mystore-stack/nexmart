"use client";
// src/components/layout/Navbar.tsx - Premium Moroccan Luxury Navbar
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, ChevronDown, Heart, LogOut, Menu, Package,
  Search, Settings, ShoppingCart, Sparkles, User, X, Star,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore, useUIStore } from "@/store/index";

const NAV_LINKS = [
  {
    label: "Boutique",
    href: "/products",
    children: [
      { label: "Sélection IA", href: "/products?sort=recommended", note: "Recommandé pour vous" },
      { label: "Électronique", href: "/products?category=electronics", note: "Appareils premium" },
      { label: "Mode", href: "/products?category=fashion", note: "Nouvelles collections" },
      { label: "Maison", href: "/products?category=home", note: "Art de vivre" },
      { label: "Beauté", href: "/products?category=beauty", note: "Soins essentiels" },
      { label: "Tous les produits", href: "/products", note: "Explorer la boutique" },
    ],
  },
  { label: "Promotions", href: "/deals" },
  { label: "Marques", href: "/brands" },
  { label: "Catégories", href: "/categories" },
];

// Moroccan geometric SVG logo mark
function MoroccanLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
      <path d="M20 6 L34 20 L20 34 L6 20 Z" stroke="rgba(212,175,55,0.8)" strokeWidth="1.5" fill="none" />
      <path d="M20 11 L29 20 L20 29 L11 20 Z" stroke="rgba(212,175,55,0.5)" strokeWidth="1" fill="none" />
      <circle cx="20" cy="20" r="4" fill="rgba(212,175,55,0.9)" />
      <path d="M20 6 L20 11 M34 20 L29 20 M20 34 L20 29 M6 20 L11 20" stroke="rgba(212,175,55,0.5)" strokeWidth="1" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F766E" />
          <stop offset="100%" stopColor="#0a5c55" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { items, openCart } = useCartStore();
  const { user, logout } = useAuthStore();
  const { openSearch, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { closeMobileMenu(); }, [pathname, closeMobileMenu]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) { openSearch(); return; }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setSearchQuery("");
  };

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-400 ${
          scrolled ? "navbar-glass" : "navbar-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
      >
        {/* Announcement Bar */}
        <div className="relative overflow-hidden bg-moroccan-navy">
          <div className="absolute inset-0 moroccan-pattern-bg opacity-30" />
          <div className="container-main flex h-9 items-center justify-center gap-3 text-xs font-semibold text-white/90">
            <span className="flex items-center gap-2">
              <Star className="h-3 w-3 text-gold-400 fill-gold-400" />
              <span className="hidden sm:inline text-white/60">|</span>
              <span>Livraison gratuite au Maroc dès 500 MAD</span>
              <span className="hidden sm:inline text-white/60">|</span>
            </span>
            <span className="hidden sm:inline text-white/55 text-[11px]">
              Artisanat Premium · Paiement Sécurisé · Support 24h
            </span>
          </div>
          {/* Gold bottom line */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
        </div>

        <div className="container-main">
          <div className="flex h-[4.25rem] items-center gap-4">
            {/* Logo */}
            <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="NexMart">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <MoroccanLogo size={42} />
              </motion.div>
              <div className="hidden sm:block">
                <span className="block font-display text-xl font-semibold tracking-tight leading-tight text-foreground">
                  NexMart
                </span>
                <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-gold-600 dark:text-gold-500 -mt-0.5">
                  Maroc · Premium
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-1 lg:flex ml-2">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                      pathname === link.href
                        ? "text-brand-700 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-400"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    {link.children && (
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeDropdown === link.label ? "rotate-180" : ""}`} />
                    )}
                  </Link>

                  <AnimatePresence>
                    {link.children && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute left-0 top-full mt-2 w-[540px] overflow-hidden rounded-2xl border border-gold-200/60 bg-white/96 p-3 shadow-luxury-lg backdrop-blur-2xl dark:bg-moroccan-navy/95 dark:border-gold-800/30"
                        style={{ boxShadow: "0 24px 64px rgba(15,23,42,0.14), 0 4px 16px rgba(15,118,110,0.08)" }}
                      >
                        <div className="grid grid-cols-[1fr_200px] gap-3">
                          <div className="grid grid-cols-2 gap-1">
                            {link.children.map((child) => (
                              <Link
                                key={child.label}
                                href={child.href}
                                className="group rounded-xl p-3 transition-all hover:bg-brand-50 dark:hover:bg-brand-900/20"
                              >
                                <span className="block text-sm font-semibold text-foreground group-hover:text-brand-700">{child.label}</span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">{child.note}</span>
                              </Link>
                            ))}
                          </div>
                          <div className="relative overflow-hidden rounded-xl p-4" style={{
                            background: "linear-gradient(135deg, #0F766E 0%, #0a5c55 100%)"
                          }}>
                            <div className="absolute inset-0 moroccan-pattern-bg opacity-20" />
                            <div className="relative">
                              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/20">
                                <Sparkles className="h-4 w-4 text-gold-300" />
                              </div>
                              <p className="text-sm font-display font-semibold text-white">Boutique IA</p>
                              <p className="mt-1 text-xs leading-relaxed text-white/70">
                                Recommandations adaptées à votre style et budget.
                              </p>
                              <Link href="/products?sort=recommended" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-gold-300 hover:text-gold-200 transition-colors">
                                Explorer →
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mx-2 hidden flex-1 md:flex">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="h-11 w-full rounded-xl border border-border/80 bg-white/80 dark:bg-card/80 pl-11 pr-24 text-sm shadow-inner-sm outline-none backdrop-blur transition-all placeholder:text-muted-foreground focus:border-brand-500/60 focus:ring-3 focus:ring-brand-500/10 focus:bg-white"
                  style={{ boxShadow: "inset 0 1px 3px rgba(15,23,42,0.06)" }}
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-700 px-3 text-xs font-bold text-white transition-all hover:bg-brand-600 hover:shadow-brand"
                >
                  <Sparkles className="h-3 w-3" />
                  Chercher
                </button>
              </div>
            </form>

            {/* Action Icons */}
            <div className="ml-auto flex items-center gap-0.5">
              <button onClick={openSearch} className="btn-ghost md:hidden" aria-label="Rechercher">
                <Search className="h-5 w-5" />
              </button>

              <Link href="/wishlist" className="btn-ghost hidden sm:flex" aria-label="Favoris">
                <Heart className="h-5 w-5" />
              </Link>

              {user && (
                <Link href="/account/notifications" className="btn-ghost relative hidden sm:flex" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-background" />
                </Link>
              )}

              <button onClick={openCart} className="btn-ghost relative" aria-label={`Panier (${cartCount})`}>
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-700 px-1 text-[10px] font-black text-white"
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {user ? (
                <div
                  className="relative hidden sm:block"
                  onMouseEnter={() => setActiveDropdown("user")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-2 rounded-xl border border-border/60 bg-white/70 dark:bg-card/70 py-1.5 pl-1.5 pr-3 text-sm font-medium backdrop-blur transition-all hover:bg-muted hover:border-gold-300/60">
                    <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-brand-700 text-xs font-black text-white">
                      {user.avatar ? (
                        <Image src={user.avatar} alt={user.name} width={32} height={32} className="h-full w-full object-cover" />
                      ) : user.name[0].toUpperCase()}
                    </div>
                    <span className="max-w-[80px] truncate text-foreground">{user.name.split(" ")[0]}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === "user" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-gold-200/40 bg-white/97 p-1.5 shadow-luxury-lg backdrop-blur-2xl dark:bg-moroccan-navy/98 dark:border-gold-800/20"
                      >
                        <div className="mb-1 border-b border-border/60 px-3 py-3">
                          <p className="truncate text-sm font-semibold">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        {[
                          { icon: User, label: "Mon compte", href: "/account" },
                          { icon: Package, label: "Mes commandes", href: "/orders" },
                          { icon: Heart, label: "Favoris", href: "/wishlist" },
                          ...(isAdmin ? [{ icon: Settings, label: "Administration", href: "/admin" }] : []),
                        ].map(({ icon: Icon, label, href }) => (
                          <Link key={label} href={href} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-700 transition-colors">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {label}
                          </Link>
                        ))}
                        <button
                          onClick={logout}
                          className="mt-1 flex w-full items-center gap-2.5 rounded-xl border-t border-border/50 px-3 py-2.5 text-left text-sm text-destructive hover:bg-destructive/8 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Se déconnecter
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden items-center gap-2 sm:flex ml-1">
                  <Link href="/login" className="btn-outline h-10 px-4 text-sm flex items-center justify-center text-center">Connexion</Link>
                  <Link href="/register" className="btn-primary h-10 px-5 text-sm flex items-center justify-center text-center">Rejoindre</Link>
                </div>
              )}

              <button onClick={toggleMobileMenu} className="btn-ghost lg:hidden ml-1" aria-label="Menu">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Gold bottom accent */}
        {scrolled && (
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
        )}
      </motion.header>

      <div className="h-[calc(4.25rem+36px)]" />

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-moroccan-navy/50 backdrop-blur-sm lg:hidden"
              onClick={closeMobileMenu}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-sm overflow-y-auto bg-moroccan-sand dark:bg-moroccan-navy border-l border-gold-200/40 dark:border-gold-800/20 p-5 shadow-2xl lg:hidden"
            >
              <div className="absolute inset-0 moroccan-pattern-bg opacity-5" />
              <div className="relative">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MoroccanLogo size={36} />
                    <div>
                      <span className="font-display text-lg font-semibold">NexMart</span>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-gold-600 -mt-0.5">Maroc · Premium</span>
                    </div>
                  </div>
                  <button onClick={closeMobileMenu} className="btn-ghost">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSearch} className="mb-5">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher..."
                      className="input pl-10"
                    />
                  </div>
                </form>

                <nav className="space-y-1.5">
                  {NAV_LINKS.map((link) => (
                    <div key={link.label} className="rounded-2xl border border-gold-200/40 bg-white/60 dark:bg-card/50 dark:border-gold-800/20 p-1">
                      <Link href={link.href} className="flex items-center rounded-xl px-3.5 py-3 text-sm font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-700 transition-colors">
                        {link.label}
                      </Link>
                      {link.children && (
                        <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                          {link.children.slice(0, 4).map((child) => (
                            <Link key={child.label} href={child.href} className="rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>

                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gold-200/40 dark:border-gold-800/20 pt-5">
                  {user ? (
                    <>
                      <Link href="/account" className="btn btn-outline h-11 w-full justify-center text-sm">Mon Compte</Link>
                      <button onClick={logout} className="btn btn-outline h-11 w-full justify-center text-sm text-destructive">Déconnexion</button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="btn btn-outline h-11 w-full justify-center text-sm">Connexion</Link>
                      <Link href="/register" className="btn btn-primary h-11 w-full justify-center text-sm">Rejoindre</Link>
                    </>
                  )}
                </div>

                {/* Moroccan ornament */}
                <div className="mt-8 flex justify-center">
                  <svg width="80" height="40" viewBox="0 0 80 40" fill="none" className="opacity-20">
                    <path d="M40 4 L76 20 L40 36 L4 20 Z" stroke="#D4AF37" strokeWidth="1" fill="none" />
                    <path d="M40 12 L62 20 L40 28 L18 20 Z" stroke="#D4AF37" strokeWidth="1" fill="none" />
                    <circle cx="40" cy="20" r="4" fill="#D4AF37" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
