"use client";
// src/components/mobile/MobileNav.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { useCartStore } from "@/store/cart";

const NAV_ITEMS = [
  { href: "/m" as const, label: "Home", icon: "🏠", badge: false },
  { href: "/m/categories" as const, label: "Categories", icon: "📂", badge: false },
  { href: "/m/deals" as const, label: "Deals", icon: "⚡", badge: false },
  { href: "/m/cart" as const, label: "Cart", icon: "🛒", badge: true },
] as const;

/**
 * Fixed bottom navigation for mobile app.
 */
export function MobileNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.items.length);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg"
      style={{ maxWidth: "448px", margin: "0 auto" }}
    >
      <div className="flex items-center justify-around py-2 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors relative",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-xl leading-none" aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold">{item.label}</span>
              {item.badge && cartCount > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
