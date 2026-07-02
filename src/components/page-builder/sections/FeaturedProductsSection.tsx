import React from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import type { ProductSectionConfig, PageSection, Product } from "../types";

interface FeaturedProductsSectionProps {
  section: PageSection;
  products?: Product[];
  isLoading?: boolean;
}

export function FeaturedProductsSection({ section, products = [], isLoading = false }: FeaturedProductsSectionProps) {
  const config = section.config as ProductSectionConfig;
  const displayProducts = config.manualProducts || products;

  if (isLoading) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className={`grid gap-6 ${
            config.columns === 2
              ? "grid-cols-2"
              : config.columns === 3
              ? "grid-cols-3"
              : config.columns === 4
              ? "grid-cols-4"
              : "grid-cols-4"
          }`}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (displayProducts.length === 0) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          No products to display
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {config.title && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{config.title}</h2>
            {config.subtitle && (
              <p className="text-gray-600 mt-2">{config.subtitle}</p>
            )}
          </div>
        )}

        <div
          className={`grid gap-6 ${
            config.columns === 2
              ? "grid-cols-2"
              : config.columns === 3
              ? "grid-cols-3"
              : config.columns === 4
              ? "grid-cols-4"
              : "grid-cols-4"
          }`}
        >
          {displayProducts.map((product: Product, index: number) => (
            <div
              key={product.id || index}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="aspect-square bg-gray-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-gray-900">
                    {product.price ? `${product.price} MAD` : "Price not set"}
                  </span>
                  <button className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
