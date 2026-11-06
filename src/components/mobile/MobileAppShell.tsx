"use client";

import { useEffect, useState } from "react";
import { MobileBottomNav } from "./MobileBottomNav";

/**
 * NexMart — Mobile App Shell
 *
 * Detects the "NexmartApp" UserAgent injected by capacitor.config.ts.
 * When detected:
 *   - Loads mobile.css design system
 *   - Renders MobileBottomNav
 *   - Sets <html data-app="true"> for CSS targeting
 *
 * This component is added once in the root layout.
 * It renders NOTHING on web browsers — zero impact on the website.
 */

export function MobileAppShell() {
  const [isApp, setIsApp] = useState(false);
  const [locale, setLocale] = useState<"fr" | "ar">("fr");

  useEffect(() => {
    // Detect NexmartApp UserAgent (set in capacitor.config.ts via appendUserAgent)
    const ua = navigator.userAgent;
    const appMode = ua.includes("NexmartApp");

    if (!appMode) return;

    setIsApp(true);

    // Mark <html> for CSS targeting
    document.documentElement.setAttribute("data-app", "true");
    document.documentElement.setAttribute("data-platform", "android");

    // Detect locale from <html lang="..."> or localStorage
    const htmlLang = document.documentElement.lang;
    const savedLocale = localStorage.getItem("nexmart-locale");
    const detectedLocale = savedLocale || htmlLang || "fr";
    if (detectedLocale.startsWith("ar")) {
      setLocale("ar");
      document.documentElement.dir = "rtl";
    } else {
      setLocale("fr");
      document.documentElement.dir = "ltr";
    }

    // Dynamically load mobile CSS
    if (!document.getElementById("nm-mobile-css")) {
      const link = document.createElement("link");
      link.id = "nm-mobile-css";
      link.rel = "stylesheet";
      link.href = "/styles/mobile.css";
      document.head.appendChild(link);
    }

    // Prevent body scroll when bottom sheet is open
    document.body.addEventListener("touchmove", (e) => {
      const target = e.target as HTMLElement;
      if (target.closest(".nm-bottom-sheet-overlay")) {
        e.preventDefault();
      }
    }, { passive: false });

    // Handle Android back button via Capacitor
    // The bridge calls window.history.back() by default; we reinforce it here.
    const handlePopState = () => {
      // If at root, Capacitor will minimize the app — that's correct behavior.
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (!isApp) return null;

  return <MobileBottomNav locale={locale} />;
}
