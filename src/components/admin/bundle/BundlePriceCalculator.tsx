"use client";

import React from "react";
import { DollarSign, Percent, TrendingDown, Calculator } from "lucide-react";
import type { BundlePriceCalculation } from "./types";

interface BundlePriceCalculatorProps {
  products: Array<{ price: number }>;
  discountPercent: number;
  onDiscountChange: (discount: number) => void;
  onPriceChange: (price: number) => void;
  disabled?: boolean;
}

export function BundlePriceCalculator({
  products,
  discountPercent,
  onDiscountChange,
  onPriceChange,
  disabled = false,
}: BundlePriceCalculatorProps) {
  const originalTotal = products.reduce((sum, product) => sum + product.price, 0);
  const discountAmount = (originalTotal * discountPercent) / 100;
  const finalPrice = originalTotal - discountAmount;
  const savings = discountAmount;

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      onDiscountChange(value);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onPriceChange(value);
    }
  };

  const suggestedDiscount = products.length >= 3 ? 20 : products.length >= 2 ? 15 : 10;
  const suggestedPrice = originalTotal - (originalTotal * suggestedDiscount) / 100;

  return (
    <div className="space-y-4 p-6 rounded-xl border border-border bg-muted/30">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Bundle Price Calculator</h3>
      </div>

      {/* Original Total */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-background">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Original Total</span>
        </div>
        <span className="font-semibold">{originalTotal.toFixed(2)} MAD</span>
      </div>

      {/* Discount Input */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Percent className="w-4 h-4" />
          Discount Percentage
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={discountPercent}
            onChange={handleDiscountChange}
            disabled={disabled}
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="text-muted-foreground">%</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onDiscountChange(10)}
            disabled={disabled}
            className="px-3 py-1 text-xs rounded-full border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            10%
          </button>
          <button
            type="button"
            onClick={() => onDiscountChange(15)}
            disabled={disabled}
            className="px-3 py-1 text-xs rounded-full border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            15%
          </button>
          <button
            type="button"
            onClick={() => onDiscountChange(20)}
            disabled={disabled}
            className="px-3 py-1 text-xs rounded-full border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            20%
          </button>
          <button
            type="button"
            onClick={() => onDiscountChange(25)}
            disabled={disabled}
            className="px-3 py-1 text-xs rounded-full border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            25%
          </button>
        </div>
      </div>

      {/* Custom Price Input */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <DollarSign className="w-4 h-4" />
          Custom Bundle Price (Optional)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={finalPrice}
          onChange={handlePriceChange}
          disabled={disabled}
          placeholder="Auto-calculated from discount"
          className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">
          Leave empty to auto-calculate from discount percentage
        </p>
      </div>

      {/* Calculation Summary */}
      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Discount Amount</span>
          <span className="font-medium text-red-500">-{discountAmount.toFixed(2)} MAD</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Customer Saves</span>
          <span className="font-medium text-green-500 flex items-center gap-1">
            <TrendingDown className="w-4 h-4" />
            {savings.toFixed(2)} MAD
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="font-semibold">Final Bundle Price</span>
          <span className="text-xl font-bold text-primary">{finalPrice.toFixed(2)} MAD</span>
        </div>
      </div>

      {/* Suggested Pricing */}
      {products.length >= 2 && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Suggested pricing:</p>
          <button
            type="button"
            onClick={() => onDiscountChange(suggestedDiscount)}
            disabled={disabled}
            className="w-full p-3 rounded-lg border border-dashed border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">{suggestedDiscount}% discount</span>
                <p className="text-xs text-muted-foreground">
                  for {products.length} products
                </p>
              </div>
              <span className="font-bold text-primary">{suggestedPrice.toFixed(2)} MAD</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
