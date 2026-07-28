"use client";

import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag } from "lucide-react";

interface SponsoredDeal {
  id: string;
  image: string;
  title: string;
  brand: string;
  price: number;
  discount: number;
}

const DEFAULT_SPONSORED: SponsoredDeal[] = [
  {
    id: "sponsor-1",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
    title: "Premium Wireless Headphones",
    brand: "TechBrand",
    price: 1299,
    discount: 35,
  },
  {
    id: "sponsor-2",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
    title: "Luxury Smartwatch",
    brand: "LuxeWatch",
    price: 2499,
    discount: 25,
  },
];

interface SponsoredDealsSectionProps {
  deals?: SponsoredDeal[];
}

export function SponsoredDealsSection({
  deals = DEFAULT_SPONSORED,
}: SponsoredDealsSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="px-4 py-6"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="text-xl font-black text-neutral-900 mb-4 flex items-center gap-2"
      >
        <TrendingUp className="w-5 h-5 text-orange-500" />
        Trending Deals
      </motion.h2>

      <div className="space-y-3">
        {deals.map((deal) => (
          <motion.div
            key={deal.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 4 }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 p-3 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex gap-3 items-center">
              {/* Image */}
              <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-white overflow-hidden border border-orange-100">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-bold text-orange-600">SPONSORED</p>
                  <span className="text-xs px-2 py-0.5 bg-orange-500 text-white rounded-full font-bold">
                    -{deal.discount}%
                  </span>
                </div>
                <p className="text-sm font-bold text-neutral-900 line-clamp-1">
                  {deal.title}
                </p>
                <p className="text-xs text-neutral-600">{deal.brand}</p>
                <div className="mt-1 flex items-center gap-1">
                  <span className="font-black text-red-600">
                    {deal.price.toLocaleString("fr-MA")}
                  </span>
                  <span className="text-xs text-neutral-500 line-through">
                    {Math.round(deal.price / (1 - deal.discount / 100)).toLocaleString("fr-MA")}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 p-2 bg-white rounded-lg hover:bg-orange-50 transition-colors"
              >
                <ShoppingBag className="w-5 h-5 text-orange-600" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
