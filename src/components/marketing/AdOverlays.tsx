"use client";

import { useEffect, useState } from "react";
import type { AdvertisementDTO } from "@/lib/marketing/types";
import { AdBanner } from "./AdBanner";
import { X } from "lucide-react";

function trackEvent(adId: string, eventType: "view" | "click") {
  fetch("/api/marketing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adId, eventType }),
  }).catch(() => {});
}

export function AdPopup({ ads }: { ads: AdvertisementDTO[] }) {
  const [visible, setVisible] = useState(false);
  const [ad] = ads;

  useEffect(() => {
    if (!ad) return;
    const dismissed = sessionStorage.getItem(`ad-popup-${ad.id}`);
    if (!dismissed) {
      const t = setTimeout(() => {
        setVisible(true);
        trackEvent(ad.id, "view");
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [ad]);

  if (!ad || !visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-lg">
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem(`ad-popup-${ad.id}`, "1");
            setVisible(false);
          }}
          className="absolute -right-2 -top-2 z-10 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100"
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
        </button>
        <AdBanner ad={ad} onTrack={(type) => trackEvent(ad.id, type)} />
      </div>
    </div>
  );
}

export function FloatingAdBanner({ ads }: { ads: AdvertisementDTO[] }) {
  const [dismissed, setDismissed] = useState(false);
  const ad = ads[0];

  useEffect(() => {
    if (ad) trackEvent(ad.id, "view");
  }, [ad]);

  if (!ad || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md md:left-auto md:right-6">
      <div className="relative shadow-2xl rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-2 z-10 rounded-full bg-black/40 p-1 text-white"
          aria-label="Dismiss"
        >
          <X className="h-3 w-3" />
        </button>
        <AdBanner ad={ad} onTrack={(type) => trackEvent(ad.id, type)} />
      </div>
    </div>
  );
}
