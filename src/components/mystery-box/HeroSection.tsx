"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface HeroSectionProps {
  onDiscoverClick?: () => void;
  bannerImage?: string;
}

export function HeroSection({ onDiscoverClick, bannerImage }: HeroSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl mx-4 mt-4 mb-6"
    >
      {/* Background with gradient overlay */}
      <div
        className="relative h-80 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden"
        style={{
          backgroundImage: bannerImage
            ? `url(${bannerImage})`
            : "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Moroccan pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />

        {/* Animated geometric shapes */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-96 h-96 rounded-full border border-amber-500/20 -translate-y-1/2 translate-x-1/2"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full border border-orange-500/20 translate-y-1/2 -translate-x-1/2"
        />

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 flex flex-col items-center justify-center px-6 py-12 text-center"
        >
          {/* Icon */}
          <motion.div
            variants={itemVariants}
            className="mb-4"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl"
            >
              🎁
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-black text-white mb-2 leading-tight"
          >
            Mystery Box
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg text-neutral-200 mb-6 font-light tracking-wide"
          >
            Surprise Products at Amazing Prices
          </motion.p>

          {/* Value proposition */}
          <motion.div
            variants={itemVariants}
            className="flex gap-4 justify-center mb-8 text-sm"
          >
            <div className="px-3 py-1.5 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-100">
              ✨ Premium Items
            </div>
            <div className="px-3 py-1.5 bg-orange-500/20 border border-orange-400/40 rounded-full text-orange-100">
              🇲🇦 Moroccan Touch
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDiscoverClick}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            Discover Boxes
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-5 h-5 text-white/60" />
      </motion.div>
    </motion.section>
  );
}
