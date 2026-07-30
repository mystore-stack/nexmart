"use client";
/**
 * Navbar — NexMart Enterprise
 * Premium Vercel/Linear-level navigation with:
 * - NextAuth session awareness (Google avatar, role badge)
 * - AI search modal trigger
 * - Dark mode toggle
 * - Animated cart badge
 * - WCAG 2.1 AA accessible keyboard nav
 */
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Search, Heart, User, Menu, X, ChevronDown,
  Bell, Package, LogOut, Settings, Zap, Moon, Sun, Sparkles
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore, useUIStore } from "@/store/index";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const NAV_LINKS = [
  {
    label: "Shop",
    href: "/products",
    children: [
      { label: "All Products",  href: "/products" },
      { label: "Electronics",   href: "/products?category=electronics" },
      { label: "Fashion",       href: "/products?category=fashion" },
      { label: "Home & Living", href: "/products?category=home-living" },
      { label: "Sports",        href: "/products?category=sports" },
      { label: "Beauty",        href: "/products?category=beauty" },
    ],
  },
  { label: "Deals",        href: "/deals" },
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "Trending",     href: "/products?sort=popular" },
];

export function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { data: session } = useSession();
  const { user, logout, setUser } = useAuthStore();
  const { items, openCart } = useCartStore();
  const { openSearch, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
  const { theme, setTheme } = useTheme();

  const [scrolled,       setScrolled]       = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mounted,        setMounted]        = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => { closeMobileMenu(); }, [pathname]); // eslint-disable-line

  // Sync NextAuth session → Zustand store
  useEffect(() => {
    if (session?.user && !user) {
      setUser({
        id:     session.user.id,
        name:   session.user.name  ?? "",
        email:  session.user.email ?? "",
        avatar: session.user.image ?? null,
        role:   session.user.role  ?? "USER",
      } as any);
    }
  }, [session, user, setUser]);

  const cartCount  = items.reduce((s, i) => s + i.quantity, 0);
  const activeUser = user ?? (session?.user ? { ...session.user, avatar: session.user.image } : null);
  const isAdmin    = activeUser?.role === "ADMIN" || activeUser?.role === "SUPER_ADMIN";

  const handleLogout = useCallback(async () => {
    await nextAuthSignOut({ redirect: false }).catch(() => {});
    await logout();
  }, [logout]);

  const toggleDark = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm" : "bg-background"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Announcement bar */}
        <div className="bg-foreground text-background text-xs font-medium text-center py-2 px-4">
          <span className="flex items-center justify-center gap-2">
            <Zap className="w-3 h-3 text-brand-400 flex-shrink-0" />
            Livraison gratuite dès 500 MAD · Code{" "}
            <span className="font-bold text-brand-300 font-mono">NEXMART10</span>{" "}
            pour -10%
            <Sparkles className="w-3 h-3 text-brand-400 flex-shrink-0" />
          </span>
        </div>

        <div className="container-main">
          <div className="flex items-center h-16 gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group" aria-label="NexMart Home">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center group-hover:bg-brand-500 transition-colors duration-200">
                <span className="text-background font-black text-sm font-display">N</span>
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:block">NexMart</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-4" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <div key={link.label} className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
                      pathname.startsWith(link.href) ? "text-brand-500" : "text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    {link.children && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
                  </Link>
                  <AnimatePresence>
                    {link.children && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.13 }}
                        className="absolute top-full left-0 mt-1.5 w-52 bg-popover border border-border rounded-xl shadow-luxury-lg overflow-hidden p-1 z-50"
                      >
                        {link.children.map((child) => (
                          <Link key={child.label} href={child.href}
                            className="flex items-center px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors text-foreground/80 hover:text-foreground">
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* AI Search bar (desktop) — triggers modal */}
            <button onClick={openSearch}
              className="hidden md:flex flex-1 max-w-md mx-4 items-center gap-3 px-4 py-2.5 bg-muted rounded-xl text-sm text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all border border-transparent hover:border-border group"
              aria-label="Search products"
            >
              <Search className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">Search products, brands...</span>
              <span className="hidden lg:flex items-center gap-0.5 text-[11px] opacity-50 group-hover:opacity-70">
                <kbd className="px-1.5 py-0.5 bg-background rounded border border-border font-mono">⌘</kbd>
                <kbd className="px-1.5 py-0.5 bg-background rounded border border-border font-mono">K</kbd>
              </span>
            </button>

            {/* Right actions */}
            <div className="flex items-center gap-0.5 ml-auto">
              {/* Mobile search */}
              <button onClick={openSearch} className="btn-ghost p-2 md:hidden" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>

              {/* Dark mode */}
              {mounted && (
                <button onClick={toggleDark} className="btn-ghost p-2 hidden sm:flex" aria-label="Toggle theme">
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              {/* Wishlist */}
              <Link href="/wishlist" className="btn-ghost p-2 hidden sm:flex" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
              </Link>

              {/* Notifications */}
              {activeUser && (
                <Link href="/account/notifications" className="btn-ghost p-2 relative hidden sm:flex" aria-label="Notifications">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border border-background" />
                </Link>
              )}

              {/* Cart */}
              <button onClick={openCart} className="btn-ghost p-2 relative" aria-label={`Cart — ${cartCount} items`}>
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span key={cartCount} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none">
                      {cartCount > 9 ? "9+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* User menu */}
              {activeUser ? (
                <div className="relative hidden sm:block"
                  onMouseEnter={() => setActiveDropdown("user")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-muted transition-colors ml-1">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={activeUser.avatar || ""} />
                      <AvatarFallback>
                        {activeUser?.name?.charAt(0).toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium max-w-[72px] truncate">
                      {(activeUser.name ?? "").split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === "user" && (
                      <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }} transition={{ duration: 0.13 }}
                        className="absolute top-full right-0 mt-1.5 w-56 bg-popover border border-border rounded-xl shadow-luxury-lg overflow-hidden p-1 z-50"
                      >
                        <div className="px-3 py-2.5 border-b border-border mb-1">
                          <p className="text-sm font-semibold truncate">{activeUser.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{activeUser.email}</p>
                          {isAdmin && (
                            <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">
                              {activeUser.role}
                            </span>
                          )}
                        </div>
                        {[
                          { icon: User,     label: "My Account",       href: "/account" },
                          { icon: Package,  label: "My Orders",         href: "/orders" },
                          { icon: Heart,    label: "Wishlist",           href: "/wishlist" },
                          ...(isAdmin ? [{ icon: Settings, label: "Admin Dashboard", href: "/admin" }] : []),
                        ].map(({ icon: Icon, label, href }) => (
                          <Link key={label} href={href}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors">
                            <Icon className="w-4 h-4 text-muted-foreground" />{label}
                          </Link>
                        ))}
                        <div className="border-t border-border mt-1 pt-1">
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-left">
                            <LogOut className="w-4 h-4" />Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 ml-2">
                  <Link href="/login"    className="btn-ghost px-3 py-2 text-sm font-medium">Sign In</Link>
                  <Link href="/register" className="btn-primary px-4 py-2 text-sm">Sign Up</Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button onClick={toggleMobileMenu} className="btn-ghost p-2 lg:hidden ml-1" aria-label="Menu" aria-expanded={mobileMenuOpen}>
                <AnimatePresence mode="wait">
                  <motion.div key={mobileMenuOpen ? "x" : "m"} initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Height spacer */}
      <div className="h-[calc(4rem+32px)]" />

      {/* ⌘K shortcut */}
      {typeof window !== "undefined" && (
        <kbd className="sr-only" aria-hidden />
      )}

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={closeMobileMenu} />

            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[min(320px,90vw)] bg-background border-l border-border overflow-y-auto lg:hidden flex flex-col"
              aria-label="Mobile menu"
            >
              <div className="p-5 flex items-center justify-between border-b border-border">
                <span className="font-bold text-lg">Menu</span>
                <button onClick={closeMobileMenu} className="btn-ghost p-2" aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile search trigger */}
              <div className="px-5 py-4 border-b border-border">
                <button onClick={() => { closeMobileMenu(); openSearch(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-muted rounded-xl text-sm text-muted-foreground">
                  <Search className="w-4 h-4" />Search products...
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1" aria-label="Mobile navigation">
                {NAV_LINKS.map((link) => (
                  <div key={link.label}>
                    <Link href={link.href}
                      className="flex items-center px-3 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="ml-3 pl-3 border-l border-border space-y-0.5 mb-1">
                        {link.children.map((child) => (
                          <Link key={child.label} href={child.href}
                            className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              <div className="p-5 border-t border-border space-y-3">
                {activeUser ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2 bg-muted rounded-xl">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={activeUser.avatar || ""} />
                        <AvatarFallback>
                          {activeUser?.name?.charAt(0).toUpperCase() || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{activeUser.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{activeUser.email}</p>
                      </div>
                    </div>
                    <Link href="/account" className="btn-outline w-full justify-center py-2.5 text-sm">My Account</Link>
                    <Link href="/orders"  className="btn-ghost w-full justify-center py-2.5 text-sm">My Orders</Link>
                    <button onClick={handleLogout} className="btn-ghost w-full justify-center py-2.5 text-sm text-destructive">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link href="/login"    className="btn-outline w-full justify-center py-2.5 text-sm">Sign In</Link>
                    <Link href="/register" className="btn-primary w-full justify-center py-2.5 text-sm">Create Account</Link>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
