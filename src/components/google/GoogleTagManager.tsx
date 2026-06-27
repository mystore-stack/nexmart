"use client";

import { useEffect } from "react";
import Script from "next/script";

interface GoogleTagManagerProps {
  containerId?: string;
}

export function GoogleTagManager({ containerId }: GoogleTagManagerProps) {
  const gtmId = containerId || process.env.NEXT_PUBLIC_GTM_CONTAINER_ID;

  useEffect(() => {
    if (!gtmId) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js",
    });
  }, [gtmId]);

  if (!gtmId) return null;

  return (
    <Script
      id="gtm-script"
      src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
      strategy="afterInteractive"
    />
  );
}

export function pushDataLayer(event: string, data?: Record<string, any>) {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event,
      ...data,
    });
  }
}

export function trackCustomEvent(eventName: string, parameters: Record<string, any>) {
  pushDataLayer("customEvent", {
    eventName,
    ...parameters,
  });
}

export function trackUserProperties(userId: string, properties: Record<string, any>) {
  pushDataLayer("userProperties", {
    userId,
    ...properties,
  });
}
