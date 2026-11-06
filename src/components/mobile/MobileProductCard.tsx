"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { useWishlistStore } from "@/store";
import { shareProduct } from "@/lib/nexshare";

/**
 * NexMart — Mobile Product Card
 * Phase 1 — Design System Component
 */

interface MobileProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: string[];
    rating?: number;
    reviewCount?: number;
    stock?: number;
    featured?: boolean;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MobileProductCard({ product, size = "md", className = "" }: MobileProductCardProps) {
  const { hasItem, addItem } = useWishlistStore();
  const [wishActive, setWishActive] = useState(() => hasItem(product.id));
  const [wishAnim, setWishAnim] = useState(false);

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const isNew = !discount && product.featured;
  const image = product.images?.[0] || "/placeholder.jpg";

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishAnim(true);
    addItem(product as any);
    setWishActive(hasItem(product.id));
    setTimeout(() => setWishAnim(false), 400);
  };

  const widthMap = { sm: "160px", md: "180px", lg: "220px" };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`nm-product-card ${className}`}
      style={{ width: widthMap[size], display: "block", textDecoration: "none" }}
    >
      {/* Image */}
      <div className="nm-product-card__image-wrap">
        <Image
          src={image}
          alt={product.name}
          fill
          className="nm-product-card__image"
          sizes="(max-width: 768px) 50vw, 220px"
        />

        {/* Badge */}
        {discount && (
          <span className="nm-product-card__badge nm-product-card__badge--sale">
            -{discount}%
          </span>
        )}
        {isNew && (
          <span className="nm-product-card__badge nm-product-card__badge--new">
            Nouveau
          </span>
        )}
        {product.stock === 0 && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(12,31,27,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: "12px", fontWeight: 600, background: "rgba(0,0,0,0.5)", padding: "4px 10px", borderRadius: "9999px" }}>
              Épuisé
            </span>
          </div>
        )}

        {/* Quick share button */}
        <button
          className="nm-product-card__share"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            shareProduct(product as any);
          }}
          aria-label="Partager"
          style={{
            position: "absolute",
            top: "8px",
            right: "48px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(12, 31, 27, 0.12)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Share2 size={15} color="#3D5A54" />
        </button>

        {/* Wishlist button */}
        <button
          className="nm-product-card__wishlist"
          onClick={handleWishlist}
          aria-label={wishActive ? "Retirer des favoris" : "Ajouter aux favoris"}
          style={{
            transform: wishAnim ? "scale(1.35)" : "scale(1)",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <Heart
            size={16}
            strokeWidth={2}
            fill={wishActive ? "#EF4444" : "none"}
            stroke={wishActive ? "#EF4444" : "#3D5A54"}
          />
        </button>
      </div>

      {/* Body */}
      <div className="nm-product-card__body">
        <p className="nm-product-card__name">{product.name}</p>

        <div className="nm-product-card__price-row">
          <span className="nm-product-card__price">
            {product.price.toLocaleString("fr-MA")} MAD
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="nm-product-card__compare-price">
              {product.comparePrice.toLocaleString("fr-MA")}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating && product.rating > 0 && (
          <div className="nm-product-card__rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4AF37" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>{product.rating.toFixed(1)}</span>
            {product.reviewCount ? <span style={{ color: "var(--nm-text-tertiary)" }}>({product.reviewCount})</span> : null}
          </div>
        )}
      </div>
    </Link>
  );
}
