import React from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "../ProductCard";

interface BestSellersSectionProps {
  config: any;
}

export async function BestSellersSection({ config }: BestSellersSectionProps) {
  let products: any[] = [];
  
  try {
    products = await prisma.product.findMany({
      where: {
        published: true,
        isVisible: true,
      },
      include: {
        category: true,
      },
      orderBy: { soldCount: 'desc' },
      take: 8,
    });
  } catch (error) {
    console.error("Error fetching best sellers:", error);
  }

  // Show placeholder if no products available
  const displayProducts = products.length > 0 ? products : [
    { id: '1', name: 'Luxury Handbag', price: 2500, comparePrice: 3000, rating: 4.8, reviewCount: 150, slug: 'luxury-handbag', category: { name: 'Fashion' }, images: [] },
    { id: '2', name: 'Designer Watch', price: 1800, comparePrice: 2200, rating: 4.7, reviewCount: 95, slug: 'designer-watch', category: { name: 'Accessories' }, images: [] },
    { id: '3', name: 'Premium Perfume', price: 850, comparePrice: 1100, rating: 4.9, reviewCount: 200, slug: 'premium-perfume', category: { name: 'Beauty' }, images: [] },
    { id: '4', name: 'Silk Scarf', price: 450, comparePrice: 600, rating: 4.6, reviewCount: 65, slug: 'silk-scarf', category: { name: 'Fashion' }, images: [] },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">{config.title || "Best Sellers"}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
