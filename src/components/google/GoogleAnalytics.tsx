"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const gaId = measurementId || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

  useEffect(() => {
    if (!gaId) return;

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", gaId);
  }, [gaId]);

  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
    </>
  );
}

export function trackEvent(
  eventName: string,
  parameters?: Record<string, any>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, parameters);
  }
}

export function trackPageView(pagePath: string, pageTitle: string) {
  trackEvent("page_view", {
    page_path: pagePath,
    page_title: pageTitle,
  });
}

export function trackPurchase(
  transactionId: string,
  value: number,
  currency: string,
  items: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>
) {
  trackEvent("purchase", {
    transaction_id: transactionId,
    value,
    currency,
    items,
  });
}

export function trackAddToCart(
  itemId: string,
  itemName: string,
  price: number,
  quantity: number
) {
  trackEvent("add_to_cart", {
    item_id: itemId,
    item_name: itemName,
    price,
    quantity,
  });
}

export function trackBeginCheckout(
  value: number,
  currency: string,
  items: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>
) {
  trackEvent("begin_checkout", {
    value,
    currency,
    items,
  });
}

export function trackSearch(searchTerm: string) {
  trackEvent("search", {
    search_term: searchTerm,
  });
}

export function trackViewProduct(
  itemId: string,
  itemName: string,
  category: string,
  price: number
) {
  trackEvent("view_item", {
    item_id: itemId,
    item_name: itemName,
    item_category: category,
    price,
  });
}

export function trackViewCategory(categoryName: string) {
  trackEvent("view_item_list", {
    item_list_name: categoryName,
  });
}

export function trackLogin(method: string) {
  trackEvent("login", {
    method,
  });
}

export function trackSignup(method: string) {
  trackEvent("sign_up", {
    method,
  });
}

export function trackContactForm(formName: string) {
  trackEvent("generate_lead", {
    form_name: formName,
  });
}

export function trackWishlist(
  itemId: string,
  itemName: string,
  category: string,
  price: number
) {
  trackEvent("add_to_wishlist", {
    item_id: itemId,
    item_name: itemName,
    item_category: category,
    price,
  });
}
