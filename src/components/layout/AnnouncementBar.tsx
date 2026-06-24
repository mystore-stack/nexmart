"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";

export function AnnouncementBar() {
  const { announcement, settings } = useSiteConfig();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  // CMS announcement takes priority
  if (announcement) {
    return (
      <div
        className="relative py-3 px-4 text-center text-sm font-medium"
        style={{
          backgroundColor: announcement.backgroundColor,
          color: announcement.textColor,
        }}
      >
        <div className="container-main flex items-center justify-center gap-2">
          {announcement.icon && <span>{announcement.icon}</span>}
          <span>{announcement.text}</span>
          {announcement.ctaText && announcement.ctaLink && (
            <Link href={announcement.ctaLink} className="ml-2 underline underline-offset-2 font-semibold">
              {announcement.ctaText}
            </Link>
          )}
        </div>
        {announcement.dismissible !== false && (
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: announcement.textColor }}
            aria-label="Close announcement"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  // Fallback to site settings shipping message (no hardcoded business copy)
  if (settings.freeShippingMessage) {
    return (
      <div
        className="relative overflow-hidden py-2 text-center text-xs font-semibold text-white/90"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <div className="container-main">{settings.freeShippingMessage}</div>
      </div>
    );
  }

  return null;
}
