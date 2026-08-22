"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeroData } from "@/lib/homepage/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroProps {
  data: HeroData;
}

export function Hero({ data }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const slides = [data];

  useEffect(() => {
    if (data.countdownEnabled && data.countdownEnd) {
      const timer = setInterval(() => {
        const now = new Date();
        const diff = new Date(data.countdownEnd).getTime() - now.getTime();

        if (diff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft({ hours, minutes, seconds });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [data.countdownEnabled, data.countdownEnd]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  const getImage = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768 && currentSlide.mobileImage) return currentSlide.mobileImage;
      if (window.innerWidth < 1024 && currentSlide.tabletImage) return currentSlide.tabletImage;
    }
    return currentSlide.desktopImage;
  };

  return (
    <section className="relative w-full h-[600px] overflow-hidden bg-gray-900">
      {/* Background Image */}
      {currentSlide.desktopImage && (
        <div className="absolute inset-0">
          <Image
            src={getImage() || currentSlide.desktopImage}
            alt={currentSlide.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            {currentSlide.badge && (
              <div
                className="inline-block px-4 py-2 rounded text-sm font-semibold mb-6"
                style={{
                  backgroundColor: currentSlide.badge.backgroundColor || '#0D7A5E',
                  color: currentSlide.badge.textColor || '#ffffff',
                }}
              >
                {currentSlide.badge.text}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
              {currentSlide.title}
            </h1>

            {/* Subtitle */}
            {currentSlide.subtitle && (
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white/90">
                {currentSlide.subtitle}
              </h2>
            )}

            {/* Description */}
            {currentSlide.description && (
              <p className="text-lg mb-8 text-white/80 max-w-xl">
                {currentSlide.description}
              </p>
            )}

            {/* Countdown */}
            {currentSlide.countdownEnabled && currentSlide.countdownEnd && (
              <div className="flex items-center gap-4 mb-8">
                {[
                  { value: timeLeft.hours, label: 'Hours' },
                  { value: timeLeft.minutes, label: 'Minutes' },
                  { value: timeLeft.seconds, label: 'Seconds' },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="bg-white/20 rounded px-6 py-3 min-w-[80px]">
                      <div className="text-2xl font-bold text-white">
                        {String(item.value).padStart(2, '0')}
                      </div>
                      <span className="text-xs text-white/70 uppercase mt-1 block">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            {currentSlide.ctaButtons && currentSlide.ctaButtons.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {currentSlide.ctaButtons.map((button: any, index: number) => (
                  <Link
                    key={index}
                    href={button.link}
                    className="px-8 py-3 rounded font-semibold text-white hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                    style={{
                      backgroundColor: button.style === 'primary'
                        ? (button.backgroundColor || '#0D7A5E')
                        : (button.backgroundColor || 'rgba(255,255,255,0.2)'),
                    }}
                  >
                    {button.text}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carousel Navigation */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-8' : 'bg-white/50 w-2'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
