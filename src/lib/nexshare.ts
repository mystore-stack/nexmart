import { Share } from "@capacitor/share";
import toast from "react-hot-toast";

/**
 * NexShare — Unified Mobile & Web Native Sharing Service
 * Phase 3 — Shopping & Loyalty
 */

export interface ShareOptions {
  title: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}

export async function nexShare(options: ShareOptions): Promise<boolean> {
  const url = options.url?.startsWith("http")
    ? options.url
    : `${typeof window !== "undefined" ? window.location.origin : "https://nexmart-ma1-main.vercel.app"}${options.url || ""}`;

  const sharePayload = {
    title: options.title,
    text: options.text || options.title,
    url,
    dialogTitle: options.dialogTitle || "Partager avec NexMart",
  };

  // 1. Try Capacitor Native Share plugin
  try {
    const canShareResult = await Share.canShare().catch(() => ({ value: false }));
    if (canShareResult.value) {
      await Share.share(sharePayload);
      return true;
    }
  } catch (err) {
    console.debug("[NexShare] Capacitor share skipped or not available:", err);
  }

  // 2. Try Web Share API (built into Android Chrome WebView)
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: sharePayload.title,
        text: sharePayload.text,
        url: sharePayload.url,
      });
      return true;
    } catch (err: any) {
      if (err.name === "AbortError") {
        // User closed the share sheet
        return false;
      }
      console.debug("[NexShare] navigator.share error:", err);
    }
  }

  // 3. Fallback: Copy link to clipboard
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié dans le presse-papier !");
      return true;
    }
  } catch {
    // Silent
  }

  return false;
}

/**
 * Convenience helper to share a product
 */
export async function shareProduct(product: { name: string; price: number; slug: string }) {
  return nexShare({
    title: product.name,
    text: `Découvrez "${product.name}" au prix de ${product.price} MAD sur NexMart Maroc !`,
    url: `/products/${product.slug}`,
    dialogTitle: "Partager ce produit",
  });
}

/**
 * Convenience helper to share wishlist
 */
export async function shareWishlist(count: number) {
  return nexShare({
    title: "Ma liste d'envies NexMart",
    text: `Regardez ma sélection de ${count} coup(s) de cœur sur NexMart !`,
    url: "/wishlist",
    dialogTitle: "Partager ma liste d'envies",
  });
}
