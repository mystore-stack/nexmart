"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { Product } from "@/types";

interface MysteryRevealSectionProps {
  items: Product[];
}

export function MysteryRevealSection({ items }: MysteryRevealSectionProps) {
  const [revealedIndex, setRevealedIndex] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, type: "spring", stiffness: 100 },
    },
  };

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
        className="mb-6"
      >
        <h2 className="text-xl font-bold text-neutral-900 mb-1">Your Box May Contain</h2>
        <p className="text-sm text-neutral-600">Discover what could be inside</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-3 gap-3"
      >
        {items.slice(0, 6).map((item, idx) => (
          <motion.button
            key={item.id}
            variants={itemVariants}
            whileHover={{ scale: 1.1, rotateZ: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setRevealedIndex(revealedIndex === idx ? null : idx)}
            className="relative group cursor-pointer"
          >
            {/* Card background */}
            <motion.div
              animate={{
                rotateY: revealedIndex === idx ? 180 : 0,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-50 border-2 border-neutral-200 group-hover:border-neutral-300 transition-colors"
            >
              {/* Front side - box icon */}
              <motion.div
                animate={{ opacity: revealedIndex === idx ? 0 : 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-3xl mb-2"
                >
                  🎁
                </motion.div>
                <p className="text-xs font-bold text-neutral-500">Tap to Reveal</p>
              </motion.div>

              {/* Back side - product preview */}
              <motion.div
                animate={{ opacity: revealedIndex === idx ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-2"
              >
                <div className="w-full h-2/3 relative mb-1 rounded-lg overflow-hidden bg-white border border-neutral-200">
                  <img
                    src={item.images[0] || "/placeholder.jpg"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-bold text-neutral-900 text-center line-clamp-2">
                  {item.name}
                </p>
                <p className="text-xs text-neutral-600 font-semibold mt-0.5">
                  MAD {item.price.toLocaleString()}
                </p>
              </motion.div>
            </motion.div>

            {/* Hover glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-20 blur rounded-xl transition-opacity -z-10" />
          </motion.button>
        ))}
      </motion.div>

      {/* Info footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        viewport={{ once: true }}
        className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
      >
        <p className="text-xs text-blue-900">
          <strong>✨ Pro Tip:</strong> You'll receive one of these items randomly selected based on the probability distribution shown in the product details.
        </p>
      </motion.div>
    </motion.section>
  );
}
