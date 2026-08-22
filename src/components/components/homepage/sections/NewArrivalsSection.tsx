"use client";

import React from "react";
import { ProductCard } from "../ProductCard";

interface NewArrivalsSectionProps {
  config: any;
  products?: any[];
}

export function NewArrivalsSection({ config, products = [] }: NewArrivalsSectionProps) {
  // Show placeholder if no products available
  const displayProducts = products.length > 0 ? products : [
    { id: '1', name: 'Summer Collection Dress', price: 750, comparePrice: 950, rating: 4.5, reviewCount: 45, slug: 'summer-dress', category: { name: 'Fashion' }, images: [] },
    { id: '2', name: 'Wireless Earbuds Pro', price: 650, comparePrice: 800, rating: 4.7, reviewCount: 120, slug: 'wireless-earbuds', category: { name: 'Electronics' }, images: [] },
    { id: '3', name: 'Organic Face Cream', price: 280, comparePrice: 350, rating: 4.6, reviewCount: 85, slug: 'face-cream', category: { name: 'Beauty' }, images: [] },
    { id: '4', name: 'Designer Sunglasses', price: 450, comparePrice: 600, rating: 4.4, reviewCount: 35, slug: 'sunglasses', category: { name: 'Fashion' }, images: [] },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">{config.title || "New Arrivals"}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
