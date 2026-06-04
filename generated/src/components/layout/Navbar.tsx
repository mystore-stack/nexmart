"use client";
// src/components/layout/Navbar.tsx
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Search, Heart, User, Menu, X, ChevronDown,
  Bell, Package, LogOut, Settings, Sun, Moon, Zap
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore, useUIStore } from "@/store/index";
import Image from "next/image";

const NAV_LINKS = [
  {
    label: "Shop",
    href: "/products",
    children: [
      { label: "All Products", href: "/products" },
      { label: "Electronics", href: "/products?category=electronics" },
      { label: "Fashion", href: "/products?category=fashion" },
      { label: "Home & Living", href: "/products?category=home" },
      { label: "Sports", href: "/products?category=sports" },
    ],
  },
  { label: "Deals", href: "/deals" },
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "Trending", href: "/products?sort=popular" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const { items, openCart } = useCartStore();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, openSearch, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-background"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Top announcement bar */}
        <div className="bg-foreground text-background text-xs font-medium text-center py-2 px-4">
          <span className="flex items-center justify-center gap-2">
            <Zap className="w-3 h-3 text-brand-400" />
            Free shipping on orders over $50 · Use code{" "}
            <span className="font-bold text-brand-300">NEXMART10</span> for 10% off
          </span>
        </div>

        <div className="container-main">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center group-hover:bg-brand-500 transition-colors">
                <span className="text-background font-black text-sm font-display">N</span>
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:block">NexMart</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
                      pathname === link.href ? "text-brand-500" : "text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    {link.children && <ChevronDown className="w-3.5 h-3.5" />}
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {link.children && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-52 bg-popover border border-border rounded-xl shadow-luxury-lg overflow-hidden p-1"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="flex items-center px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors text-foreground/80 hover:text-foreground"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Search bar (desktop) */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands..."
                  className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground"
                />
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Mobile search */}
              <button
                onClick={openSearch}
                className="md:hidden btn-ghost p-2"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="btn-ghost p-2 hidden sm:flex"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="btn-ghost p-2 hidden sm:flex" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
              </Link>

              {/* Notifications */}
              {user && (
                <Link href="/account/notifications" className="btn-ghost p-2 relative hidden sm:flex" aria-label="Notifications">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full" />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={openCart}
                className="btn-ghost p-2 relative"
                aria-label={`Cart (${cartCount} items)`}
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* User menu */}
              {user ? (
                <div
                  className="relative hidden sm:block"
                  onMouseEnter={() => setActiveDropdown("user")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-muted transition-colors">
                    <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center text-background text-xs font-bold overflow-hidden">
                      {user.avatar ? (
                        <Image src={user.avatar} alt={user.name} width={28} height={28} className="object-cover" />
                      ) : (
                        user.name[0].toUpperCase()
                      )}
                    </div>
                    <span className="text-sm font-medium max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === "user" && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-1 w-52 bg-popover border border-border rounded-xl shadow-luxury-lg overflow-hidden p-1"
                      >
                        <div className="px-3 py-2 border-b border-border mb-1">
                          <p className="text-sm font-semibold truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        {[
                          { icon: User, label: "My Account", href: "/account" },
                          { icon: Package, label: "My Orders", href: "/orders" },
                          { icon: Heart, label: "Wishlist", href: "/wishlist" },
                          ...(isAdmin ? [{ icon: Settings, label: "Admin Dashboard", href: "/admin" }] : []),
                        ].map(({ icon: Icon, label, href }) => (
                          <Link
                            key={label}
                            href={href}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors"
                          >
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            {label}
                          </Link>
                        ))}
                        <div className="border-t border-border mt-1 pt-1">
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 ml-1">
                  <Link href="/login" className="btn-ghost px-3 py-2 text-sm">Sign In</Link>
                  <Link href="/register" className="btn-primary px-4 py-2 text-sm">Sign Up</Link>
                </div>
              )}

              {/* Mobile menu */}
              <button
                onClick={toggleMobileMenu}
                className="btn-ghost p-2 lg:hidden ml-1"
                aria-label="Menu"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mobileMenuOpen ? "close" : "open"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Spacer */}
      <div className="h-[calc(4rem+28px)]" />

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={closeMobileMenu}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-background border-l border-border overflow-y-auto lg:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-bold text-xl">Menu</span>
                  <button onClick={closeMobileMenu} className="btn-ghost p-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile search */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="input pl-10"
                    />
                  </div>
                </form>

                <nav className="space-y-1">
                  {NAV_LINKS.map((link) => (
                    <div key={link.label}>
                      <Link
                        href={link.href}
                        className="flex items-center px-3 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                      >
                        {link.label}
                      </Link>
                      {link.children && (
                        <div className="ml-4 space-y-1 border-l border-border pl-4 mt-1">
                          {link.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className="flex items-center py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>

                <div className="mt-8 pt-8 border-t border-border space-y-3">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-background font-bold">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Link href="/account" className="btn-outline w-full justify-center">My Account</Link>
                      <Link href="/orders" className="btn-ghost w-full justify-center">My Orders</Link>
                      <button onClick={logout} className="btn-ghost w-full justify-center text-destructive">Sign Out</button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="btn-outline w-full justify-center">Sign In</Link>
                      <Link href="/register" className="btn-primary w-full justify-center">Create Account</Link>
                    </>
                  )}
                </div>

                <button onClick={toggleTheme} className="mt-4 flex items-center gap-2 text-sm text-muted-foreground px-3 py-2">
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
