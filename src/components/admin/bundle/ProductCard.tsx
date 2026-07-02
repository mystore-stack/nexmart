"use client";

import React from "react";
import Image from "next/image";
import { Check, Package, Tag, DollarSign, Box } from "lucide-react";
import type { Product } from "./types";

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (productId: string) => void;
  onDeselect: (productId: string) => void;
}

export function ProductCard({ product, isSelected, onSelect, onDeselect }: ProductCardProps) {
  const handleToggle = () => {
    if (isSelected) {
      onDeselect(product.id);
    } else {
      onSelect(product.id);
    }
  };

  const stockStatus = product.stock > 10 
    ? { label: "In Stock", color: "text-green-600 bg-green-50" }
    : product.stock > 0 
    ? { label: "Low Stock", color: "text-yellow-600 bg-yellow-50" }
    : { label: "Out of Stock", color: "text-red-600 bg-red-50" };

  return (
    <div
      onClick={handleToggle}
      className={`
        relative group cursor-pointer rounded-xl border-2 transition-all duration-200
        ${isSelected 
          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
          : "border-border hover:border-primary/50 hover:bg-muted/50"
        }
      `}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 right-3 z-10">
        <div
          className={`
            w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
            ${isSelected 
              ? "border-primary bg-primary text-white" 
              : "border-gray-300 bg-white group-hover:border-primary"
            }
          `}
        >
          {isSelected && <Check className="w-4 h-4" />}
        </div>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square rounded-t-lg overflow-hidden bg-muted">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Package className="w-12 h-12" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute bottom-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
            {stockStatus.label}
          </span>
        </div>

        {/* Published Badge */}
        {!product.published && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
              Draft
            </span>
          </div>
        )}

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* SKU */}
        {product.sku && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Tag className="w-3 h-3" />
            <span>SKU: {product.sku}</span>
          </div>
        )}

        {/* Category */}
        {product.category && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Box className="w-3 h-3" />
            <span>{product.category.name}</span>
          </div>
        )}

        {/* Brand */}
        {product.brand && (
          <div className="text-xs text-muted-foreground">
            Brand: {product.brand}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-lg font-bold text-primary">
            <DollarSign className="w-4 h-4" />
            <span>{product.price.toFixed(2)}</span>
          </div>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              {product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Stock:</span>
          <span className={`font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
            {product.stock}
          </span>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground">Rating:</span>
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">/ 5</span>
          </div>
        )}
      </div>
    </div>
  );
}
