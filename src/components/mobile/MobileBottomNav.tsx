"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, Sparkles, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/store/cart";

/**
 * NexMart — Mobile Bottom Navigation
 * Injected only in app mode (NexmartApp UserAgent).
 * Modern Friendly Design — Phase 1.
 */

const NAV_ITEMS = [
  { key: "home",       href: "/",           labelFr: "Accueil",    labelAr: "الرئيسية",  Icon: Home },
  { key: "categories", href: "/categories", labelFr: "Catégories", labelAr: "الفئات",    Icon: Grid3x3 },
  { key: "discover",   href: "/explore",    labelFr: "Découvrir",  labelAr: "اكتشف",     Icon: Sparkles },
  { key: "cart",       href: "/cart",       labelFr: "Panier",     labelAr: "السلة",     Icon: ShoppingCart },
  { key: "account",    href: "/account",    labelFr: "Compte",     labelAr: "حسابي",     Icon: User },
] as const;

interface MobileBottomNavProps {
  locale?: "fr" | "ar";
}

export function MobileBottomNav({ locale = "fr" }: MobileBottomNavProps) {
  const pathname = usePathname();
  const cartItems = useCartStore((s) => s.items);
  const [mounted, setMounted] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      id="nm-bottom-nav"
      aria-label={locale === "ar" ? "التنقل الرئيسي" : "Navigation principale"}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {NAV_ITEMS.map(({ key, href, labelFr, labelAr, Icon }) => {
        const active = getActive(href);
        const label = locale === "ar" ? labelAr : labelFr;
        const isCart = key === "cart";

        return (
          <Link
            key={key}
            href={href}
            className={`nm-nav-item${active ? " active" : ""}`}
            aria-label={label}
            aria-current={active ? "page" : undefined}
          >
            <span style={{ position: "relative" }}>
              <Icon
                size={24}
                strokeWidth={active ? 2.2 : 1.8}
                fill={active ? "none" : "none"}
              />
              {/* Cart badge */}
              {isCart && cartCount > 0 && (
                <span className="nm-cart-badge">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </span>
            <span className="nm-nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
