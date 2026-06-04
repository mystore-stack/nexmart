type AiEventPayload = {
  type: "VIEW" | "SEARCH" | "ADD_TO_CART" | "PURCHASE" | "WISHLIST" | "CHAT" | "RECOMMENDATION_CLICK";
  productId?: string;
  query?: string;
  score?: number;
  metadata?: Record<string, unknown>;
};

export function trackAiEvent(payload: AiEventPayload) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify(payload);
  const url = "/api/ai/events";

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(url, blob);
    return;
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
