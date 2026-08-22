// Analytics tracking utility for frontend conversion tracking

export type EventType =
  | "page_view"
  | "product_view"
  | "search"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout_started"
  | "payment_success"
  | "order_completed"
  | "banner_click"
  | "category_click";

interface TrackEventOptions {
  eventType: EventType;
  productId?: string;
  categoryId?: string;
  bannerId?: string;
  orderId?: string;
  metadata?: Record<string, any>;
}

// Get or create session ID
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

// Track event
export async function trackEvent(options: TrackEventOptions): Promise<void> {
  if (typeof window === "undefined") return;

  const sessionId = getSessionId();
  
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...options,
        sessionId,
      }),
    });
  } catch (error) {
    console.error("Failed to track event:", error);
    // Silently fail to not disrupt user experience
  }
}

// Track page view
export function trackPageView(): void {
  trackEvent({ eventType: "page_view" });
}

// Track product view
export function trackProductView(productId: string): void {
  trackEvent({ eventType: "product_view", productId });
}

// Track search
export function trackSearch(query: string): void {
  trackEvent({ eventType: "search", metadata: { query } });
}

// Track add to cart
export function trackAddToCart(productId: string): void {
  trackEvent({ eventType: "add_to_cart", productId });
}

// Track remove from cart
export function trackRemoveFromCart(productId: string): void {
  trackEvent({ eventType: "remove_from_cart", productId });
}

// Track checkout started
export function trackCheckoutStarted(): void {
  trackEvent({ eventType: "checkout_started" });
}

// Track payment success
export function trackPaymentSuccess(orderId: string): void {
  trackEvent({ eventType: "payment_success", orderId });
}

// Track order completed
export function trackOrderCompleted(orderId: string): void {
  trackEvent({ eventType: "order_completed", orderId });
}

// Track banner click
export function trackBannerClick(bannerId: string): void {
  trackEvent({ eventType: "banner_click", bannerId });
}

// Track category click
export function trackCategoryClick(categoryId: string): void {
  trackEvent({ eventType: "category_click", categoryId });
}

// React hook for analytics
export function useAnalytics() {
  return {
    trackPageView,
    trackProductView,
    trackSearch,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckoutStarted,
    trackPaymentSuccess,
    trackOrderCompleted,
    trackBannerClick,
    trackCategoryClick,
  };
}
