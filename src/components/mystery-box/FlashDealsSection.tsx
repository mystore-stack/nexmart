"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

interface FlashDeal {
  id: string;
  name: string;
  discount: number;
  stock: number;
  endsAt: Date;
  image?: string;
}

interface FlashDealsSectionProps {
  deals?: FlashDeal[];
}

function CountdownTimer({ endsAt }: { endsAt: Date }) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = endsAt.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <div className="font-mono font-bold text-sm">
      {String(timeLeft.hours).padStart(2, "0")}:
      {String(timeLeft.minutes).padStart(2, "0")}:
      {String(timeLeft.seconds).padStart(2, "0")}
    </div>
  );
}

const DEFAULT_DEALS: FlashDeal[] = [
  {
    id: "deal-1",
    name: "Bronze Box",
    discount: 25,
    stock: 12,
    endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    image: "https://images.unsplash.com/photo-1549887534-7f7bd0bb4b10?w=300",
  },
  {
    id: "deal-2",
    name: "Silver Box",
    discount: 30,
    stock: 8,
    endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
    image: "https://images.unsplash.com/photo-1549887534-7f7bd0bb4b10?w=300",
  },
  {
    id: "deal-3",
    name: "Gold Box",
    discount: 35,
    stock: 5,
    endsAt: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
    image: "https://images.unsplash.com/photo-1549887534-7f7bd0bb4b10?w=300",
  },
];

export function FlashDealsSection({
  deals = DEFAULT_DEALS,
}: FlashDealsSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="px-4 py-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="mb-4 flex items-center gap-2"
      >
        <Zap className="w-5 h-5 text-orange-500" />
        <h2 className="text-xl font-bold text-neutral-900">Flash Deals</h2>
      </motion.div>

      <div className="space-y-3">
        {deals.map((deal, idx) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 p-3 hover:shadow-lg transition-shadow"
          >
            {/* Animated background pulse */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10"
            />

            <div className="relative z-10 flex items-center gap-3">
              {/* Product image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-orange-100 flex-shrink-0">
                <img
                  src={deal.image}
                  alt={deal.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Deal info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-neutral-900 text-sm mb-0.5">
                  {deal.name}
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-red-500 text-white font-bold rounded">
                    -{deal.discount}%
                  </span>
                  <span className="text-neutral-600">
                    {deal.stock} boxes left
                  </span>
                </div>
              </div>

              {/* Countdown */}
              <div className="text-center">
                <p className="text-xs text-neutral-600 font-semibold mb-0.5">
                  ENDS IN
                </p>
                <CountdownTimer endsAt={deal.endsAt} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
