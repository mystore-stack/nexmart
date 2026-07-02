"use client";

import React from "react";
import Image from "next/image";
import { GripVertical, X, DollarSign, Package } from "lucide-react";
import { motion } from "framer-motion";
import type { SelectedProductItem } from "./types";

interface SelectedProductsListProps {
  products: SelectedProductItem[];
  onRemove: (productId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  disabled?: boolean;
}

export function SelectedProductsList({
  products,
  onRemove,
  onReorder,
  disabled = false,
}: SelectedProductsListProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (dragIndex !== dropIndex) {
      onReorder(dragIndex, dropIndex);
    }
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-xl">
        <Package className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No products selected</p>
        <p className="text-sm text-muted-foreground mt-2">
          Click &quot;Select Products&quot; to add products to your bundle
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((item, index) => (
        <motion.div
          key={item.productId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          draggable={!disabled}
          onDragStart={(e) => handleDragStart(e as any, index)}
          onDragOver={handleDragOver as any}
          onDrop={(e) => handleDrop(e as any, index)}
          className={`
            flex items-center gap-4 p-4 rounded-xl border transition-all
            ${disabled ? "border-border bg-muted/30" : "border-border hover:border-primary/50 hover:bg-muted/50 cursor-move"}
          `}
        >
          {/* Drag Handle */}
          {!disabled && (
            <div className="cursor-grab text-muted-foreground hover:text-foreground">
              <GripVertical className="w-5 h-5" />
            </div>
          )}

          {/* Product Image */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {item.product.images && item.product.images.length > 0 ? (
              <Image
                src={item.product.images[0]}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Package className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{item.product.name}</h4>
            {item.product.sku && (
              <p className="text-xs text-muted-foreground">SKU: {item.product.sku}</p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium text-sm">{item.product.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Order Badge */}
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {index + 1}
            </span>
          </div>

          {/* Remove Button */}
          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(item.productId)}
              className="flex-shrink-0 p-2 hover:bg-red-50 rounded-lg transition-colors group"
            >
              <X className="w-4 h-4 text-muted-foreground group-hover:text-red-500" />
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
}
