"use client";

import React from "react";
import { Package, Plus, Check } from "lucide-react";

interface BuildYourOwnBundleSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function BuildYourOwnBundleSection({ section, products = [], isLoading = false }: BuildYourOwnBundleSectionProps) {
  const config = section.config || {};
  const content = config.content || {};
  const design = config.design || {};
  const { title = "Build Your Own Bundle", subtitle = "Custom bundle builder", ctaText = "Create Bundle", minItems = 2 } = content as any;
  const { background = "#fff7ed", radius = "16px", shadow = "md", color = "#ea580c" } = design as any;

  const shadowClass: string = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  }[shadow as string] || "shadow-md";

  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      if (prev.length < 6) {
        return [...prev, productId];
      }
      return prev;
    });
  };

  const bundleProducts = products.slice(0, 8);
  const totalPrice = bundleProducts
    .filter(p => selectedProducts.includes(p.id))
    .reduce((sum, p) => sum + (p.price || 0), 0);
  const bundleDiscount = selectedProducts.length >= minItems ? 0.15 : 0; // 15% discount
  const finalPrice = totalPrice * (1 - bundleDiscount);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section 
      className="container mx-auto px-4 py-12"
      style={{ backgroundColor: background }}
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Package className="w-6 h-6" style={{ color }} />
          <h2 className="text-3xl font-bold" style={{ color }}>{title}</h2>
        </div>
        <p className="text-muted-foreground">{subtitle}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Select {minItems}+ items to unlock 15% bundle discount
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {bundleProducts.length > 0 ? (
          bundleProducts.map((product) => (
            <div 
              key={product.id}
              className={`bg-white rounded-lg p-4 cursor-pointer transition-all ${shadowClass} ${
                selectedProducts.includes(product.id) ? 'ring-2' : ''
              }`}
              style={{ 
                borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
                ringColor: selectedProducts.includes(product.id) ? color : 'transparent'
              }}
              onClick={() => toggleProduct(product.id)}
            >
              <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                {selectedProducts.includes(product.id) && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
              <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-lg font-bold" style={{ color }}>
                {product.price ? `${product.price} MAD` : 'Price not available'}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No products available for bundling
          </div>
        )}
      </div>

      {selectedProducts.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span className="font-semibold">{selectedProducts.length} items selected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 line-through">{totalPrice.toFixed(2)} MAD</span>
                <span className="text-2xl font-bold" style={{ color }}>{finalPrice.toFixed(2)} MAD</span>
                {selectedProducts.length >= minItems && (
                  <span className="bg-green-500 text-white text-sm px-2 py-1 rounded">15% OFF</span>
                )}
              </div>
            </div>
            <button 
              className="py-3 px-6 rounded-lg text-white font-semibold transition-colors"
              style={{ backgroundColor: color }}
              disabled={selectedProducts.length < minItems}
            >
              {ctaText}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
