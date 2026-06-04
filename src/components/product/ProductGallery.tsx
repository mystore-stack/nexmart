"use client";
// src/components/product/ProductGallery.tsx — Moroccan Luxury Gallery
import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

interface Props { images: string[]; name: string; }

export function ProductGallery({ images, name }: Props) {
  const [current, setCurrent] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const imgs = images.length ? images : ["/placeholder.jpg"];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const prev = () => setCurrent((c) => (c - 1 + imgs.length) % imgs.length);
  const next = () => setCurrent((c) => (c + 1) % imgs.length);

  return (
    <>
      <div className="space-y-3 lg:sticky lg:top-[6rem]">
        {/* Main image */}
        <div
          className={`relative aspect-square overflow-hidden rounded-2xl border border-gold-200/40 dark:border-gold-800/20 bg-moroccan-sand dark:bg-card select-none shadow-luxury cursor-${zoomed ? "zoom-out" : "zoom-in"}`}
          onClick={() => setZoomed((z) => !z)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoomed(false)}
          style={{ boxShadow: "0 4px 24px rgba(15,23,42,0.08), 0 0 0 1px rgba(212,175,55,0.1)" }}
        >
          {/* Gold top accent */}
          <div className="absolute top-0 inset-x-0 z-10 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Image
                src={imgs[current]}
                alt={`${name} - image ${current + 1}`}
                fill
                className="object-cover transition-transform duration-300"
                style={zoomed ? { transform: `scale(2.2)`, transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Controls overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-black/30 text-white backdrop-blur-md hover:bg-black/50 transition-all"
              aria-label="Agrandir"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-black/30 text-white backdrop-blur-md hover:bg-black/50 transition-all"
              aria-label={zoomed ? "Dezoom" : "Zoom"}
            >
              {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            </button>
          </div>

          {/* Nav arrows */}
          {imgs.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-white/20 bg-black/30 text-white backdrop-blur-md hover:bg-black/50 transition-all"
                aria-label="Précédent">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-white/20 bg-black/30 text-white backdrop-blur-md hover:bg-black/50 transition-all"
                aria-label="Suivant">
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                {imgs.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                    className={`rounded-full transition-all ${i === current ? "w-5 h-1.5 bg-gold-400" : "w-1.5 h-1.5 bg-white/40"}`}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {imgs.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {imgs.map((img, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  i === current
                    ? "border-brand-700 dark:border-brand-400 shadow-brand scale-105"
                    : "border-border hover:border-gold-400/60"
                }`}
                aria-label={`Voir image ${i + 1}`}
              >
                <Image src={img} alt={`${name} miniature ${i + 1}`} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-moroccan-navy/97 backdrop-blur-sm"
            onClick={() => setLightbox(false)}
          >
            {/* Moroccan pattern overlay */}
            <div className="absolute inset-0 moroccan-pattern-bg opacity-10" />

            {/* Gold top line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />

            <button onClick={() => setLightbox(false)}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/20 transition-all">
              <X className="h-5 w-5" />
            </button>

            {imgs.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/20 transition-all">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/20 transition-all">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <motion.div
              key={current}
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative mx-8 aspect-square w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={imgs[current]} alt={name} fill className="object-contain" sizes="90vw" />
            </motion.div>

            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white/50">
              {current + 1} / {imgs.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
