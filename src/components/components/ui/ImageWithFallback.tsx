"use client";

import React from "react";
import Image from "next/image";
import "../../styles/design-tokens.css";

interface ImageWithFallbackProps {
  src: string;
  fallbackSrc?: string;
  alt?: string;
  className?: string;
}

export function ImageWithFallback({ src, fallbackSrc, alt = "image", className = "" }: ImageWithFallbackProps) {
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onError={(e) => {
        console.error('Image failed to load:', src);
        if (fallbackSrc) {
          console.log('Switching to fallback:', fallbackSrc);
          const img = e.target as HTMLImageElement;
          img.src = fallbackSrc;
        }
      }}
    />
  );
}

export default ImageWithFallback;
