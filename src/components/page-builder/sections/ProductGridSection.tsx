import React from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import type { ProductSectionConfig, PageSection, Product } from "../types";

interface ProductGridSectionProps {
  section: PageSection;
  products?: Product[];
  isLoading?: boolean;
}

export function ProductGridSection({ section, products = [], isLoading = false }: ProductGridSectionProps) {
  const config = section.config as ProductSectionConfig;

  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`py-16 md:py-24 ${
        section.spacing === "large" ? "py-32" : section.spacing === "small" ? "py-12" : ""
      }`}
      style={{ backgroundColor: section.backgroundColor || config.backgroundColor }}
    >
      <div className="container-main">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {config.title || "Featured Products"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {config.description || "Browse our selection"}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No Products Available</h3>
            <p className="text-muted-foreground">Check back later for new products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((item: Product) => {
              return (
                <div
                  key={item.id}
                  className="bg-background border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg"
                >
                  <div className="relative aspect-square">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm mb-2 line-clamp-2">{item.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        {item.price ? `${item.price} MAD` : "Price not set"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
