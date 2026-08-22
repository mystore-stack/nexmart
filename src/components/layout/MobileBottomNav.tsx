"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Heart, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/store/cart";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { items, openCart } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { icon: Home, label: "Accueil", href: "/" },
    { icon: LayoutGrid, label: "Catégories", href: "/categories" },
    { icon: Heart, label: "Favoris", href: "/wishlist" },
    { icon: ShoppingCart, label: "Panier", action: openCart },
    { icon: User, label: "Compte", href: "/account" },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-[60] pb-safe">
      <div className="flex items-center justify-around h-[60px] px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          const content = (
            <>
              <div className="relative">
                <Icon className={`h-6 w-6 mb-1 ${isActive ? "text-[#0d7a5e]" : "text-slate-500"}`} strokeWidth={isActive ? 2.5 : 2} />
                {item.label === "Panier" && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#0d7a5e] px-1 text-[8px] font-bold text-white border border-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? "text-[#0d7a5e] font-bold" : "text-slate-500 font-medium"}`}>
                {item.label}
              </span>
            </>
          );

          if (item.action) {
            return (
              <button key={item.label} onClick={item.action} className="flex flex-col items-center justify-center w-full h-full">
                {content}
              </button>
            );
          }

          return (
            <Link key={item.label} href={item.href || "/"} className="flex flex-col items-center justify-center w-full h-full">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
