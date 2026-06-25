"use client";

import type { HomeMarketingData } from "@/lib/marketing/types";
import { AdBanner } from "./AdBanner";
import { AdPopup, FloatingAdBanner } from "./AdOverlays";
import { MarketingFlashDealsSection } from "./MarketingFlashDealsSection";

function trackAd(adId: string, eventType: "view" | "click") {
  fetch("/api/marketing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adId, eventType }),
  }).catch(() => {});
}

export function MarketingHomeIntegration({ marketing }: { marketing: HomeMarketingData }) {
  const betweenAds = marketing.betweenSectionAds;
  const topBanner = marketing.topBannerAds[0];

  return (
    <>
      {topBanner && (
        <section className="container-main py-2">
          <AdBanner ad={topBanner} onTrack={(t) => trackAd(topBanner.id, t)} />
        </section>
      )}

      {betweenAds.length > 0 && (
        <section className="section bg-surface/60">
          <div className="container-main space-y-4">
            {betweenAds.map((ad) => (
              <AdBanner key={ad.id} ad={ad} onTrack={(t) => trackAd(ad.id, t)} />
            ))}
          </div>
        </section>
      )}

      {marketing.flashDeals.length > 0 && (
        <MarketingFlashDealsSection deals={marketing.flashDeals} />
      )}

      <AdPopup ads={marketing.popupAds} />
      <FloatingAdBanner ads={marketing.floatingAds} />
    </>
  );
}

export function MarketingHeroAd({ ad }: { ad: HomeMarketingData["heroAds"][0] | undefined }) {
  if (!ad) return null;
  return (
    <section className="container-main py-4 md:py-6">
      <AdBanner ad={ad} onTrack={(t) => trackAd(ad.id, t)} />
    </section>
  );
}
