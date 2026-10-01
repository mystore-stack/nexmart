"use client";

import { useEffect, useRef } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { checkIsLoggingOut } from "@/store/index";
import { useCartStore } from "@/store/cart";

function SessionSync() {
  const { data: session, status } = useSession();
  const cartSynced = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    console.log("[AUTH PROVIDER] Session state changed:", {
      status,
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userEmail: session?.user?.email || 'none'
    });

    // CRITICAL: If NextAuth says unauthenticated, respect it immediately
    if (status === "unauthenticated") {
      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        console.log("[AUTH PROVIDER] Aborted in-flight requests due to unauthenticated state");
      }

      cartSynced.current = false;
      console.log("[AUTH PROVIDER] User unauthenticated, cleared cart sync state");
      console.log("[AUTH PROVIDER] CART_REQUEST_SKIPPED_UNAUTHENTICATED");

      // IMPORTANT: Return early to prevent any authenticated requests
      return;
    }

    // If loading, also return early - don't make authenticated requests while loading
    if (status === "loading") {
      return;
    }

    // Only proceed if authenticated
    if (status !== "authenticated" || !session?.user) {
      return;
    }

    const sessionUser = session.user as {
      id?: string;
      name?: string | null;
      email?: string | null;
    };

    console.log("[AUTH PROVIDER] User authenticated:", {
      userId: sessionUser.id,
      email: sessionUser.email,
      role: (sessionUser as any)?.role,
    });

    // Sync cart from database when user logs in
    if (!cartSynced.current && sessionUser.id && !checkIsLoggingOut()) {
      cartSynced.current = true;
      const syncCart = async () => {
        // Create abort controller for this cart sync operation
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
          console.log("[AUTH PROVIDER] Syncing cart from database for user:", sessionUser.id);

          // Wait a moment for session cookies to be fully established
          await new Promise(resolve => setTimeout(resolve, 500));

          // Verify session is established before attempting cart sync
          const sessionRes = await fetch("/api/auth/session", { signal: controller.signal });
          const sessionData = await sessionRes.json();

          if (!sessionData.success || !sessionData.authenticated) {
            console.log("[AUTH PROVIDER] Session not yet established, will retry on next render");
            cartSynced.current = false; // Allow retry on next render
            return;
          }

          console.log("[AUTH PROVIDER] Session verified, proceeding with cart sync");

          // Retry mechanism for cart sync
          let retries = 3;
          let cartData;

          for (let i = 0; i < retries; i++) {
            // Abort retries if logout started
            if (checkIsLoggingOut() || controller.signal.aborted) {
              console.log("[AUTH PROVIDER] Logout in progress, aborting cart sync retries");
              cartSynced.current = false;
              return;
            }

            const cartRes = await fetch("/api/cart", { signal: controller.signal });
            cartData = await cartRes.json();

            if (cartRes.ok) {
              break;
            }

            // If 401 (unauthenticated), stop retrying
            if (cartRes.status === 401) {
              console.log("[AUTH PROVIDER] Cart sync returned 401, user unauthenticated, stopping retries");
              cartSynced.current = false;
              return;
            }

            console.log(`[AUTH PROVIDER] Cart sync attempt ${i + 1} failed, retrying...`);
            if (i < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }

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
          if (error instanceof Error && error.name === 'AbortError') {
            console.log("[AUTH PROVIDER] Cart sync aborted");
          } else {
            console.error("[AUTH PROVIDER] Cart sync error:", error);
            cartSynced.current = false; // Allow retry on next render
          }
        } finally {
          abortControllerRef.current = null;
        }
      };

      syncCart();
    }

    // Cleanup function: abort requests on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [session, status]);

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
