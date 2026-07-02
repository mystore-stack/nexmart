"use client";
import React from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { HeroBannerDisplay } from "@/components/home/HeroBannerDisplay";
import type { HeroBannerFormData } from "@/app/admin/hero/page";

interface HeroLivePreviewProps {
  bannerData: HeroBannerFormData;
}

type DeviceType = "desktop" | "tablet" | "mobile";

export function HeroLivePreview({ bannerData }: HeroLivePreviewProps) {
  const [device, setDevice] = React.useState<DeviceType>("desktop");
  
  // Debug: Log props to verify real-time updates
  console.log("[HeroLivePreview] bannerData received:", bannerData);
  
  // Convert null values to undefined for component compatibility
  const cleanBannerData: Partial<HeroBannerFormData> = React.useMemo(() => ({
    badgeText: bannerData.badgeText || undefined,
    highlightedText: bannerData.highlightedText || undefined,
    subtitle: bannerData.subtitle || undefined,
    description: bannerData.description || undefined,
    desktopImageUrl: bannerData.desktopImageUrl || undefined,
    mobileImageUrl: bannerData.mobileImageUrl || undefined,
    videoUrl: bannerData.videoUrl || undefined,
    primaryButtonText: bannerData.primaryButtonText || undefined,
    primaryButtonLink: bannerData.primaryButtonLink || undefined,
    secondaryButtonText: bannerData.secondaryButtonText || undefined,
    secondaryButtonLink: bannerData.secondaryButtonLink || undefined,
    backgroundColor: bannerData.backgroundColor || undefined,
    backgroundOverlayColor: bannerData.backgroundOverlayColor || undefined,
    overlayOpacity: bannerData.overlayOpacity,
    textColor: bannerData.textColor || undefined,
    primaryButtonColor: bannerData.primaryButtonColor || undefined,
    secondaryButtonColor: bannerData.secondaryButtonColor || undefined,
    heroHeight: bannerData.heroHeight,
    heroPosition: bannerData.heroPosition,
  }), [bannerData]);

  const deviceStyles = {
    desktop: {
      width: "100%",
      maxWidth: "100%",
      borderRadius: "1rem",
    },
    tablet: {
      width: "768px",
      maxWidth: "100%",
      margin: "0 auto",
      borderRadius: "1rem",
    },
    mobile: {
      width: "375px",
      maxWidth: "100%",
      margin: "0 auto",
      borderRadius: "1rem",
    },
  };

  return (
    <div className="space-y-4">
      {/* Device Selector */}
      <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => setDevice("desktop")}
          className={`p-2 rounded-md transition-colors ${
            device === "desktop"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
          title="Desktop"
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setDevice("tablet")}
          className={`p-2 rounded-md transition-colors ${
            device === "tablet"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
          title="Tablet"
        >
          <Tablet className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setDevice("mobile")}
          className={`p-2 rounded-md transition-colors ${
            device === "mobile"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
          title="Mobile"
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>

      {/* Preview Container */}
      <div 
        className="overflow-hidden bg-muted border borderBorder rounded-lg"
        style={deviceStyles[device]}
      >
        <div className="bg-background min-h-[400px]">
          <HeroBannerDisplay
            {...cleanBannerData}
            title={bannerData.title}
            isPreview={true}
            deviceType={device}
          />
        </div>
      </div>

      {/* Device Label */}
      <div className="text-center text-xs text-muted-foreground">
        Previewing on {device}
      </div>
    </div>
  );
}
