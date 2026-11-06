"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";

/**
 * NexMart — Mobile Promotional Banner Carousel
 * Phase 1 — Design System Component
 */

export interface BannerSlide {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  href?: string;
  textColor?: string;
}

interface MobileBannerCarouselProps {
  slides: BannerSlide[];
  autoPlayMs?: number;
  className?: string;
}

export function MobileBannerCarousel({
  slides,
  autoPlayMs = 4000,
  className = "",
}: MobileBannerCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = slides.length;

  const go = (idx: number) => {
    setCurrent(((idx % count) + count) % count);
  };

  const next = () => go(current + 1);
  const prev = () => go(current - 1);

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(next, autoPlayMs);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [current]);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setDragging(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!dragging) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
    setDragging(false);
  };

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <div className={`nm-banner-carousel ${className}`} style={{ position: "relative" }}>
      <div
        className="nm-banner"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ cursor: "grab", userSelect: "none" }}
      >
        {/* Image */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "21/9", borderRadius: "var(--nm-radius-xl)", overflow: "hidden" }}>
          <Image
            src={slide.image}
            alt={slide.title || "NexMart Promo"}
            fill
            style={{ objectFit: "cover" }}
            priority={current === 0}
            sizes="(max-width: 768px) 100vw, 800px"
          />
          {/* Gradient overlay */}
          {(slide.title || slide.subtitle) && (
            <div className="nm-banner__content">
              {slide.title && (
                <span className="nm-banner__title" style={{ color: slide.textColor || "#fff" }}>
                  {slide.title}
                </span>
              )}
              {slide.subtitle && (
                <span className="nm-banner__subtitle">{slide.subtitle}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dots */}
      {count > 1 && (
        <div className="nm-carousel-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`nm-carousel-dot${i === current ? " active" : ""}`}
              onClick={() => go(i)}
              aria-label={`Slide ${i + 1}`}
              style={{ border: "none", padding: 0, cursor: "pointer", background: "none" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
