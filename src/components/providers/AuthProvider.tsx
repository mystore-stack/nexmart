"use client";

import { useEffect, useRef } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useAuthStore } from "@/store/index";
import { useCartStore } from "@/store/cart";
import type { User } from "@/types";

function SessionSync() {
  const { data: session, status } = useSession();
  const setUser = useAuthStore((state) => state.setUser);
  const bridged = useRef(false);
  const cartSynced = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      if (status === "unauthenticated") {
        bridged.current = false;
        cartSynced.current = false;
      }
      return;
    }

    const sessionUser = session.user as {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      isVerified?: boolean;
    };

    const user: User = {
      id: sessionUser.id as string,
      name: sessionUser.name ?? "",
      email: sessionUser.email ?? "",
      avatar: sessionUser.image ?? undefined,
      role: (sessionUser.role as User["role"]) ?? "USER",
      emailVerified: sessionUser.isVerified ?? true,
      createdAt: new Date().toISOString(),
    };

    setUser(user);

    console.log("[AUTH PROVIDER] User authenticated:", {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Sync cart from database when user logs in
    if (!cartSynced.current && user.id) {
      cartSynced.current = true;
      const syncCart = async () => {
        try {
          console.log("[AUTH PROVIDER] Syncing cart from database for user:", user.id);
          const cartRes = await fetch("/api/cart");
          const cartData = await cartRes.json();
          
          console.log("[AUTH PROVIDER] Database cart response:", {
            success: cartData.success,
            itemsCount: cartData.items?.length || 0,
          });
          
          if (cartData.success && cartData.items && cartData.items.length > 0) {
            const localCart = useCartStore.getState().items;
            
            // Only sync if local cart is empty
            if (localCart.length === 0) {
              console.log("[AUTH PROVIDER] Local cart empty, syncing from database");
              useCartStore.getState().clearCart();
              
              cartData.items.forEach((dbItem: any) => {
                useCartStore.getState().addItem(
                  dbItem.product,
                  dbItem.quantity,
                  dbItem.variant || undefined
                );
              });
              
              console.log("[AUTH PROVIDER] Cart synced from database, new item count:", cartData.items.length);
            } else {
              console.log("[AUTH PROVIDER] Local cart has items, skipping sync");
            }
          } else {
            console.log("[AUTH PROVIDER] No items in database cart");
          }
        } catch (error) {
          console.error("[AUTH PROVIDER] Cart sync error:", error);
        }
      };
      
      syncCart();
    }

    if (!bridged.current) {
      bridged.current = true;
      fetch("/api/auth/bridge", { method: "POST", credentials: "include" }).catch(() => {});
    }
  }, [session, status, setUser]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync />
      {children}
    </SessionProvider>
  );
}
