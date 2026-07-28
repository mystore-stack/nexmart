"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Headphones,
  Heart,
  Home,
  Menu,
  MonitorSmartphone,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Languages,
  User,
  X,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore, useUIStore } from "@/store/index";
import { signOut } from "next-auth/react";

const categories = [
  {
    label: "Electronics",
    href: "/products?category=electronics",
    groups: ["Phones", "Audio", "Smart home", "Wearables"],
  },
  {
    label: "Fashion",
    href: "/products?category=fashion",
    groups: ["Kaftans", "Sneakers", "Bags", "Accessories"],
  },
  {
    label: "Beauty",
    href: "/products?category=beauty",
    groups: ["Argan", "Fragrance", "Skincare", "Tools"],
  },
  {
    label: "Home",
    href: "/products?category=home-living",
    groups: ["Zellige", "Lighting", "Kitchen", "Decor"],
  },
  {
    label: "Moroccan Products",
    href: "/products?category=moroccan-products",
    groups: ["Leather", "Ceramics", "Amlou", "Cooperatives"],
  },
];

const featuredMegaItems = [
  { icon: Sparkles, title: "Luxury Edit", copy: "Premium Moroccan fashion and refined everyday essentials." },
  { icon: MonitorSmartphone, title: "Tech Deals", copy: "Phones, audio, wearables, and smart devices." },
  { icon: Home, title: "Home Studio", copy: "Clean interiors, lighting, bedding, and decor." },
  { icon: Headphones, title: "Fast Picks", copy: "High-rated items ready for express shipping." },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { items, openCart } = useCartStore();
  const { user } = useAuthStore();
  const { openSearch, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
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
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className={`fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl transition-shadow duration-200 ${
          scrolled ? "shadow-[0_8px_30px_rgba(15,23,42,0.07)]" : "shadow-none"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-[1440px] items-center gap-6 px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="NexStore home">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-lg font-black text-[#d6b25e] transition group-hover:bg-[#0f5d43] group-hover:text-white">
              N
            </span>
            <span className="text-2xl font-semibold tracking-normal text-slate-950">NexStore</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden flex-1 xl:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                type="search"
                placeholder="Search products, brands, sellers..."
                className="h-[52px] w-full rounded-full border border-slate-200 bg-[#F9F9F9] px-14 py-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f5d43] focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 inline-flex h-10 -translate-y-1/2 items-center gap-2 rounded-full bg-[#0f5d43] px-5 text-sm font-bold text-white transition hover:bg-[#0b4834]"
              >
                Search
              </button>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={openSearch} className="grid h-11 w-11 place-items-center rounded-full text-slate-700 transition hover:bg-emerald-50 hover:text-[#0f5d43] xl:hidden" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="grid h-11 w-11 place-items-center rounded-full text-slate-700 transition hover:bg-emerald-50 hover:text-[#0f5d43]"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-14 w-56 rounded-xl border border-slate-200 bg-white shadow-xl"
                  >
                    {user ? (
                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-slate-100 mb-2">
                          <p className="text-sm font-medium text-slate-900">{user.name || user.email}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        <Link
                          href="/account"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Mon Compte
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Mes Commandes
                        </Link>
                        <Link
                          href="/wishlist"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4" />
                          Ma Liste
                        </Link>
                        {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        )}
                        <div className="border-t border-slate-100 mt-2 pt-2">
                          <button
                            onClick={() => {
                              handleLogout();
                              setUserMenuOpen(false);
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Déconnexion
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2">
                        <Link
                          href="/login"
                          className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Connexion
                        </Link>
                        <Link
                          href="/register"
                          className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Inscription
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/wishlist" className="grid h-11 w-11 place-items-center rounded-full text-slate-700 transition hover:bg-emerald-50 hover:text-[#0f5d43]" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
            <button className="hidden h-11 items-center gap-1 rounded-full px-3 text-xs font-black text-slate-700 transition hover:bg-emerald-50 hover:text-[#0f5d43] md:inline-flex" aria-label="Language">
              <Languages className="h-4 w-4" />
              FR
            </button>
            <button onClick={openCart} className="relative grid h-11 w-11 place-items-center rounded-full text-slate-700 transition hover:bg-emerald-50 hover:text-[#0f5d43]" aria-label={`Cart (${cartCount})`}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-[#0f5d43] px-1 text-[10px] font-black text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
            <button onClick={toggleMobileMenu} className="grid h-11 w-11 place-items-center rounded-full text-slate-700 transition hover:bg-emerald-50 hover:text-[#0f5d43] lg:hidden" aria-label="Menu">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)} className="hidden border-t border-slate-100 lg:block">
          <nav className="mx-auto flex h-12 max-w-[1440px] items-center gap-1 px-8">
            <button className="mr-2 inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-[#0f5d43]">
              <ShoppingBag className="h-4 w-4" />
              All departments
              <ChevronDown className={`h-4 w-4 transition ${megaOpen ? "rotate-180" : ""}`} />
            </button>
            {categories.map((category) => (
              <Link
                key={category.label}
                href={category.href}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-[#0f5d43]"
              >
                {category.label}
              </Link>
            ))}
          </nav>

          <AnimatePresence>
            {megaOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-x-0 top-[132px] border-y border-slate-200 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.12)]"
              >
                <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_380px] gap-8 px-8 py-8">
                  <div className="grid grid-cols-3 gap-5">
                    {categories.map((category) => (
                      <div key={category.label}>
                        <Link href={category.href} className="flex items-center gap-2 text-sm font-bold text-slate-950 transition hover:text-[#0f5d43]">
                          {category.label}
                          <ArrowGlyph />
                        </Link>
                        <div className="mt-3 grid gap-2">
                          {category.groups.map((item) => (
                            <Link key={item} href={category.href} className="text-sm text-slate-500 transition hover:text-[#0f5d43]">
                              {item}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-[#F9F9F9] p-5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0f5d43]">
                      <ShieldCheck className="h-4 w-4" />
                      Featured marketplace edits
                    </div>
                    <div className="mt-5 grid gap-3">
                      {featuredMegaItems.map(({ icon: Icon, title, copy }) => (
                        <Link key={title} href="/products" className="group flex gap-3 rounded-lg bg-white p-3 transition hover:shadow-sm">
                          <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-[#0f5d43]">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-slate-950 group-hover:text-[#0f5d43]">{title}</span>
                            <span className="mt-1 block text-xs leading-5 text-slate-500">{copy}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <div className="h-[132px]" />

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 290, damping: 30 }}
            className="fixed bottom-0 right-0 top-0 z-[60] w-full max-w-sm border-l border-slate-200 bg-white p-6 shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold">NexStore</span>
              <button onClick={closeMobileMenu} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 grid gap-2">
              {categories.map((category) => (
                <Link key={category.label} href={category.href} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold">
                  {category.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ArrowGlyph() {
  return <span aria-hidden="true" className="text-[#0f5d43]">-&gt;</span>;
}
