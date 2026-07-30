"use client";
// src/components/home/BundleBuilderSection.tsx — Section 13: Bundle Builder
import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Check, Layers, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import toast from "react-hot-toast";

interface BundleItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

const BUNDLE_ITEMS: BundleItem[] = [
  {
    id: "b-1",
    name: "Apple Watch Series 8",
    category: "Smartwatch",
    price: 1199,
    image: "/images/promo_bundle.jpg",
  },
  {
    id: "b-2",
    name: "AirPods Pro 2",
    category: "Écouteurs",
    price: 1799,
    image: "/images/promo_flash_sale.jpg",
  },
  {
    id: "b-3",
    name: "iPhone 15 Pro",
    category: "Smartphone",
    price: 12499,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "b-4",
    name: "Casque Sony WH-1000XM5",
    category: "Casque",
    price: 2499,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
  },
];

export function BundleBuilderSection() {
  const [selectedIds, setSelectedIds] = useState<string[]>(["b-1", "b-2", "b-3", "b-4"]);
  const addItem = useCartStore((state) => state.addItem);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedCount = selectedIds.length;
  const discountRate = selectedCount >= 4 ? 0.3 : selectedCount === 3 ? 0.2 : selectedCount === 2 ? 0.1 : 0;
  
  const totalPriceRaw = BUNDLE_ITEMS.filter((i) => selectedIds.includes(i.id)).reduce((acc, curr) => acc + curr.price, 0);
  const finalPrice = Math.round(totalPriceRaw * (1 - discountRate));
  const savings = totalPriceRaw - finalPrice;

  const handleAddBundleToCart = () => {
    const selectedItems = BUNDLE_ITEMS.filter((i) => selectedIds.includes(i.id));
    if (selectedItems.length === 0) {
      toast.error("Veuillez sélectionner au moins un produit pour créer un bundle.");
      return;
    }

    selectedItems.forEach((item) => {
      const fullProduct: Product = {
        id: `bundle-${item.id}`,
        name: `${item.name} (Pack Bundle)`,
        slug: item.id,
        description: item.name,
        price: Math.round(item.price * (1 - discountRate)),
        images: [item.image],
        categoryId: "cat-1",
        category: { id: "cat-1", name: "Bundle", slug: "bundle" },
        tags: ["bundle-pack"],
        sku: item.id,
        stock: 10,
        lowStockAt: 2,
        published: true,
        featured: true,
        rating: 5,
        reviewCount: 100,
        soldCount: 50,
        variants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addItem(fullProduct, 1);
    });

    toast.success(`Pack Bundle (${selectedItems.length} produits) ajouté au panier avec -${discountRate * 100}% de réduction !`);
  };

  return (
    <section id="bundle-builder" className="my-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-emerald-100/40 border border-emerald-200/60 p-6 md:p-8 shadow-luxury">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Text Info Left */}
          <div className="space-y-3 lg:max-w-xs text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 text-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Layers className="h-3.5 w-3.5" />
              Offres Spéciales
            </span>
            <h2 className="font-display text-3xl font-extrabold text-foreground tracking-tight">
              CRÉEZ VOTRE BUNDLE
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choisissez vos produits préférés et économisez jusqu&apos;à <span className="font-bold text-emerald-800">30% sur votre commande</span>.
            </p>

            <button
              onClick={handleAddBundleToCart}
              className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm px-6 py-3 shadow-luxury transition-all active:scale-95"
            >
              Créer mon bundle
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Product Items Slots Middle */}
          <div className="flex flex-wrap items-center justify-center gap-3 my-2">
            {BUNDLE_ITEMS.map((item, idx) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <React.Fragment key={item.id}>
                  {idx > 0 && <Plus className="h-5 w-5 text-emerald-600/60 flex-shrink-0" />}

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleSelect(item.id)}
                    className={`relative cursor-pointer h-28 w-28 rounded-2xl border p-2 flex flex-col items-center justify-center transition-all bg-white shadow-sm ${
                      isSelected
                        ? "border-emerald-600 ring-2 ring-emerald-500/20"
                        : "border-border/60 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px]">
                      {isSelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    </div>

                    <div className="relative h-14 w-14 mb-1">
                      <Image src={item.image} alt={item.name} fill className="object-contain" />
                    </div>

                    <span className="text-[10px] font-bold truncate max-w-full text-foreground">
                      {item.category}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-semibold">
                      {item.price.toLocaleString("fr-MA")} DH
                    </span>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Total Savings Callout Right */}
          <div className="bg-white rounded-2xl border border-emerald-200/80 p-5 text-center min-w-[200px] shadow-sm flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
              Remise Bundle
            </span>
            <div className="font-display text-2xl font-black text-emerald-700 leading-tight mb-1">
              Économisez jusqu&apos;à <br />
              <span className="text-3xl text-emerald-600">-{discountRate * 100}%</span>
            </div>

            {savings > 0 && (
              <p className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full mt-2 border border-emerald-200">
                Vous économisez {savings.toLocaleString("fr-MA")} DH
              </p>
            )}

            <div className="mt-3 text-xs font-black text-foreground">
              Total: {finalPrice.toLocaleString("fr-MA")} DH
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
