"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, ChevronDown, Heart, LogOut, Menu, Package,
  Search, Settings, ShoppingCart, Sparkles, User, X,
  Camera, Award, Scale, Compass, CheckCircle2,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useUIStore, useWishlistStore } from "@/store/index";
import { useCompareStore } from "@/store/compare";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { useSession, signOut } from "next-auth/react";
import type { NavigationItemData } from "@/lib/cms/data";
import { NexmartEmblem } from "@/components/ui/NexmartLogo";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, navigation } = useSiteConfig();
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isApp, setIsApp] = useState(false);
  const [points, setPoints] = useState<number | null>(null);

  // NextAuth Session
  const { data: session, status } = useSession();
  const user = session?.user as { id?: string; name?: string | null; email?: string | null; role?: string; avatar?: string | null } | null;
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  // Stores
  const { items: cartItems, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { items: compareItems } = useCompareStore();
  const { openSearch, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const compareCount = compareItems.length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.userAgent.includes("NexmartApp")) {
      setIsApp(true);
    }
  }, []);

  // Fetch NexPoints balance when logged in
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/loyalty", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && typeof d.balance === "number" && setPoints(d.balance))
        .catch(() => {});
    }
  }, [status]);

  const navLinks: Array<{
    label: string;
    href: string;
    children?: Array<{ label: string; href: string; note?: string }>;
  }> = navigation.map((item: NavigationItemData) => ({
    label: item.label,
    href: item.url || "/",
    children: item.children?.map((c) => ({
      label: c.label,
      href: c.url || "/",
      note: c.badge || undefined,
    })),
  }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      openSearch();
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setSearchQuery("");
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 dark:bg-[#071611]/95 backdrop-blur-xl shadow-[0_4px_24px_rgba(12,31,27,0.06)] border-b border-stone-200/80 dark:border-stone-800/80"
            : "bg-white dark:bg-[#071611] border-b border-stone-200/60 dark:border-stone-800/60"
        }`}
      >
        {/* Subtle Moroccan Gold Top Trim */}
        <div className="h-[2.5px] w-full bg-gradient-to-r from-[#084C3E] via-[#D4AF37] to-[#19C79C]" />

        <div className="container-main">
          <div className="flex h-16 sm:h-[4.75rem] items-center justify-between gap-3 sm:gap-6">
            
            {/* ── 1. Logo & Brand Identity ──────────────────────────────── */}
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-2.5 sm:gap-3 transition duration-200"
              aria-label={settings.storeName || "NexMart"}
            >
              <div className="relative flex items-center justify-center">
                {settings.logoUrl ? (
                  <Image
                    src={settings.logoUrl}
                    alt={settings.storeName}
                    width={40}
                    height={40}
                    className="rounded-xl object-contain drop-shadow-sm group-hover:scale-105 transition duration-200"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#084C3E] via-[#0B6B57] to-[#0A7D63] p-1.5 shadow-md shadow-emerald-900/15 flex items-center justify-center group-hover:scale-105 transition duration-200">
                    <NexmartEmblem size={26} color="#FFFFFF" />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center leading-none">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-extrabold tracking-tight text-xl sm:text-2xl text-slate-900 dark:text-white">
                    {settings.storeName || "NexMart"}
                  </span>
                  <span className="hidden xs:inline-flex text-[9px] font-bold uppercase tracking-widest text-[#B8860B] bg-amber-50 dark:bg-amber-950/40 border border-amber-300/40 rounded-full px-1.5 py-0.5">
                    Maroc
                  </span>
                </div>
                <span className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5">
                  {settings.storeTagline || "Marketplace Premium · Artisanat & Mode"}
                </span>
              </div>
            </Link>

            {/* ── 2. Desktop Navigation Links ────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-1 ml-2">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                      pathname === link.href
                        ? "bg-[#0B6B57] text-white shadow-sm shadow-emerald-900/20"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-950"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.children && (
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          activeDropdown === link.label ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {/* Mega Menu Dropdown */}
                  <AnimatePresence>
                    {link.children && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.16 }}
                        className="absolute left-0 top-full mt-2 w-[520px] overflow-hidden rounded-2xl border border-stone-200 bg-white/98 dark:bg-slate-950/98 p-3 shadow-2xl backdrop-blur-2xl dark:border-stone-800"
                      >
                        <div className="grid grid-cols-[1fr_190px] gap-3">
                          <div className="grid grid-cols-2 gap-1.5 p-1">
                            {link.children.map((child) => (
                              <Link
                                key={child.label}
                                href={child.href}
                                className="group rounded-xl p-2.5 transition hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              >
                                <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#0B6B57]">
                                  {child.label}
                                </span>
                                {child.note && (
                                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{child.note}</span>
                                )}
                              </Link>
                            ))}
                          </div>
                          
                          {/* Moroccan Selection Side Banner */}
                          <div className="rounded-xl bg-gradient-to-br from-[#084C3E] to-[#0B6B57] p-4 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#C8F169] mb-1.5">
                                <Sparkles size={11} />
                                Sélection IA
                              </span>
                              <h4 className="font-bold text-sm leading-tight text-white mb-1">
                                Coups de Cœur
                              </h4>
                              <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                                Les meilleures ventes et nouveautés sélectionnées pour vous.
                              </p>
                            </div>
                            <Link
                              href="/products?featured=true"
                              className="relative z-10 text-xs font-bold text-[#C8F169] hover:underline flex items-center gap-1 mt-3"
                            >
                              Explorer tout →
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* ── 3. Smart Search & Scanner Bar ─────────────────────────── */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-md mx-2 relative items-center"
            >
              <div className="relative w-full flex items-center">
                <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher artisanat, mode, électronique..."
                  className="h-10 w-full rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 pl-10 pr-20 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-[#0B6B57] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#0B6B57]/15"
                />

                {/* Right side shortcuts */}
                <div className="absolute right-2 flex items-center gap-1">
                  {/* NexScan Shortcut Button */}
                  <Link
                    href="/scan"
                    className="w-7 h-7 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#0B6B57] flex items-center justify-center transition"
                    title="Scanner un code QR ou code-barres (NexScan)"
                    aria-label="NexScan"
                  >
                    <Camera size={14} />
                  </Link>

                  {/* Search Key shortcut pill */}
                  <button
                    type="submit"
                    className="h-7 px-2.5 rounded-full bg-[#0B6B57] text-white text-[11px] font-bold hover:bg-[#084C3E] transition flex items-center"
                    aria-label="Rechercher"
                  >
                    <Search size={12} />
                  </button>
                </div>
              </div>
            </form>

            {/* ── 4. Right Action Buttons & User Menu ─────────────────────── */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Delivery Micro-Badge (Desktop) */}
              <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/40 px-2.5 py-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 mr-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Livraison Maroc 24-48h</span>
              </div>

              {/* NexPoints Pill (when authenticated) */}
              {status === "authenticated" && (
                <Link
                  href="/loyalty"
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-500/20 border border-amber-300/50 text-amber-800 dark:text-amber-300 text-xs font-bold hover:scale-105 transition"
                  title="Mes NexPoints"
                >
                  <Award size={14} className="text-[#D4AF37]" />
                  <span>{points !== null ? points.toLocaleString("fr-MA") : "0"}</span>
                  <span className="text-[10px] opacity-75 font-normal">pts</span>
                </Link>
              )}

              {/* Product Comparison Floating Indicator */}
              {compareCount > 0 && (
                <Link
                  href="/compare"
                  className="hidden sm:flex relative w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#0B6B57] transition"
                  aria-label={`Comparateur (${compareCount})`}
                  title="Comparateur de produits"
                >
                  <Scale size={18} />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0B6B57] text-white text-[9px] font-bold flex items-center justify-center">
                    {compareCount}
                  </span>
                </Link>
              )}

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="hidden sm:flex relative w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#0B6B57] transition"
                aria-label={`Favoris (${wishlistCount})`}
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Search Modal Trigger on Mobile */}
              <button
                onClick={openSearch}
                className="flex md:hidden w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 items-center justify-center text-slate-700 dark:text-slate-300"
                aria-label="Recherche"
              >
                <Search size={18} />
              </button>

              {/* NexScan shortcut on mobile */}
              <Link
                href="/scan"
                className="flex md:hidden w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#0B6B57]"
                aria-label="Scanner"
              >
                <Camera size={18} />
              </Link>

              {/* Shopping Cart Button */}
              <button
                onClick={openCart}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#0B6B57] text-white shadow-md shadow-emerald-900/20 hover:bg-[#084C3E] active:scale-95 transition"
                aria-label={`Panier (${cartCount})`}
              >
                <ShoppingCart size={19} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* User Account Menu / Login Button */}
              {status === "authenticated" && user ? (
                <div
                  className="relative hidden sm:block"
                  onMouseEnter={() => setActiveDropdown("user")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 pr-2.5 text-xs font-semibold hover:border-[#0B6B57] transition">
                    <Avatar className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800">
                      <AvatarImage src={user.avatar || ""} />
                      <AvatarFallback className="bg-[#0B6B57] text-white text-xs font-bold">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[70px] truncate text-slate-800 dark:text-slate-100">
                      {user.name?.split(" ")[0] || "Compte"}
                    </span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === "user" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-stone-200 bg-white p-1.5 shadow-2xl dark:border-stone-800 dark:bg-slate-950"
                      >
                        <div className="mb-1 border-b border-slate-100 dark:border-slate-800 p-2.5">
                          <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="truncate text-[11px] text-slate-400">{user.email}</p>
                        </div>
                        {[
                          { icon: User, label: "Mon Compte", href: "/account" },
                          { icon: Package, label: "Mes Commandes", href: "/orders" },
                          { icon: Award, label: "NexPoints Club", href: "/loyalty" },
                          { icon: Heart, label: "Mes Favoris", href: "/wishlist" },
                          ...(isAdmin ? [{ icon: Settings, label: "Administration", href: "/admin" }] : []),
                        ].map(({ icon: Icon, label, href }) => (
                          <Link
                            key={label}
                            href={href}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-[#0B6B57] transition"
                          >
                            <Icon size={15} className="text-slate-400" />
                            <span>{label}</span>
                          </Link>
                        ))}
                        <button
                          onClick={handleLogout}
                          className="mt-1 flex w-full items-center gap-2.5 rounded-xl border-t border-slate-100 dark:border-slate-800 px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        >
                          <LogOut size={15} />
                          <span>Se déconnecter</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5">
                  <Link
                    href="/login"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B6B57] text-white hover:bg-[#084C3E] transition shadow-sm"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle (Only on Web, hidden when in App mode) */}
              {!isApp && (
                <button
                  onClick={toggleMobileMenu}
                  className="flex lg:hidden w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 items-center justify-center text-slate-700 dark:text-slate-300"
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── 5. Mobile Drawer Menu (Web) ─────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && !isApp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={closeMobileMenu}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-xs overflow-y-auto bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-5 shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0B6B57] flex items-center justify-center text-white">
                    <NexmartEmblem size={20} color="#fff" />
                  </div>
                  <span className="font-display font-bold text-lg">{settings.storeName || "NexMart"}</span>
                </div>
                <button onClick={closeMobileMenu} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl pl-9 pr-3 py-2 text-xs outline-none"
                  />
                </div>
              </form>

              {/* Nav Links */}
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <div key={link.label} className="py-1">
                    <Link
                      href={link.href}
                      className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    >
                      {link.label}
                    </Link>
                  </div>
                ))}
              </div>

              {/* Quick Hub Links */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <Link href="/scan" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40">
                  <Camera size={16} />
                  <span>NexScan (Scanner QR / Barcode)</span>
                </Link>
                <Link href="/loyalty" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 dark:bg-amber-950/40">
                  <Award size={16} />
                  <span>NexPoints Club</span>
                </Link>
                <Link href="/compare" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100">
                  <Scale size={16} />
                  <span>Comparateur</span>
                </Link>
              </div>

              {/* Auth footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                {status === "authenticated" && user ? (
                  <div className="space-y-2">
                    <Link href="/account" className="block w-full py-2.5 text-center text-xs font-bold rounded-xl bg-slate-100 text-slate-800">
                      Mon Compte
                    </Link>
                    <button onClick={handleLogout} className="block w-full py-2.5 text-center text-xs font-bold rounded-xl border border-rose-200 text-rose-600">
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login" className="py-2.5 text-center text-xs font-bold rounded-xl bg-slate-100 text-slate-800">
                      Connexion
                    </Link>
                    <Link href="/register" className="py-2.5 text-center text-xs font-bold rounded-xl bg-[#0B6B57] text-white">
                      S'inscrire
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
