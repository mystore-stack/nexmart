"use client";
// src/components/home/HeroSection.tsx - Responsive hero with mobile/desktop separation
import React, { useEffect, useState } from "react";
import { MobileHero } from "./MobileHero";
import { DesktopHero } from "./DesktopHero";

export function HeroSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // lg breakpoint = 1024px, but we use tablet cutoff at 768px
    };

    checkMobile();
    const handleResize = () => checkMobile();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Default to desktop during SSR
  if (typeof window === "undefined") {
    return <DesktopHero />;
  }

  return isMobile ? <MobileHero /> : <DesktopHero />;
}
