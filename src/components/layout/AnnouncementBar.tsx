"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";

export function AnnouncementBar() {
  const { announcement, settings } = useSiteConfig();
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  if (!isVisible) return null;

  const sharedContent = announcement
    ? {
        text: announcement.text,
        icon: announcement.icon,
        ctaText: announcement.ctaText,
        ctaLink: announcement.ctaLink,
        dismissible: announcement.dismissible !== false,
        backgroundColor: announcement.backgroundColor,
        textColor: announcement.textColor,
      }
    : settings.freeShippingMessage
      ? {
          text: settings.freeShippingMessage,
          icon: "Concierge",
          ctaText: settings.storeTagline || undefined,
          ctaLink: undefined,
          dismissible: false,
          backgroundColor: settings.primaryColor,
          textColor: "#ffffff",
        }
      : null;

  if (!sharedContent) return null;

  if (isHomepage) {
    return (
      <div className="relative z-[55] overflow-hidden border-b border-[#c89b3c]/12 bg-[#071611] text-white">
        <div className="absolute inset-y-0 right-0 w-96 bg-[radial-gradient(circle_at_center,rgba(200,155,60,0.18),transparent_70%)]" />
        <div className="container-main relative py-2.5">
          <div className="flex min-h-[2.75rem] flex-col items-center justify-between gap-2 sm:flex-row sm:gap-4">
            <div className="flex flex-wrap items-center justify-center gap-2 text-center sm:justify-start">
              <span className="inline-flex rounded-full border border-[#c89b3c]/35 bg-[#c89b3c]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#f0d69d]">
                Livraison premium
              </span>
              <span className="text-xs font-medium leading-5 text-white/90 sm:text-sm">{sharedContent.text}</span>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              {["48h au Maroc", "Retours 30 jours", "Paiement sécurisé"].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/72"
                >
                  {badge}
                </span>
              ))}
            </div>

            {sharedContent.ctaText && sharedContent.ctaLink ? (
              <Link
                href={sharedContent.ctaLink}
                className="inline-flex rounded-full bg-[#c89b3c] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#b8892f]"
              >
                {sharedContent.ctaText}
              </Link>
            ) : null}
          </div>
        </div>
        {sharedContent.dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white/70 transition hover:bg-white/14 hover:text-white"
            aria-label="Fermer l'annonce"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

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

  return (
    <div
      className="relative overflow-hidden py-2 text-center text-xs font-semibold text-white/90"
      style={{ backgroundColor: settings.primaryColor }}
    >
      <div className="container-main">{settings.freeShippingMessage}</div>
    </div>
  );
}
