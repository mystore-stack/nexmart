"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronDown, Zap } from "lucide-react";

interface HeroBannerProps {
  bannerImage?: string;
  title?: string;
  subtitle?: string;
  endTime?: Date;
}

function CountdownDisplay({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="flex items-center gap-1 font-mono font-bold text-white">
      <span>{String(timeLeft.hours).padStart(2, "0")}</span>
      <span>:</span>
      <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
      <span>:</span>
      <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
    </div>
  );
}

export function HeroBanner({
  bannerImage,
  title = "Flash Sale",
  subtitle = "Up to 70% off",
  endTime = new Date(Date.now() + 6 * 60 * 60 * 1000),
}: HeroBannerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl mx-4 mt-4 mb-6"
    >
      {/* Background */}
      <div
        className="relative h-72 bg-gradient-to-br from-red-600 via-red-500 to-orange-600 overflow-hidden"
        style={{
          backgroundImage: bannerImage
            ? `url(${bannerImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50" />

        {/* Animated background shapes */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-96 h-96 rounded-full border border-red-400/20 -translate-y-1/2 translate-x-1/2"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full border border-orange-400/20 translate-y-1/2 -translate-x-1/2"
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
              className="flex items-center justify-center"
            >
              <Zap className="w-12 h-12 text-white drop-shadow-lg" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-black text-white mb-2 leading-tight"
          >
            {title}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg text-white/90 mb-6 font-light tracking-wide"
          >
            {subtitle}
          </motion.p>

          {/* Countdown */}
          <motion.div
            variants={itemVariants}
            className="px-4 py-3 bg-black/40 backdrop-blur-sm rounded-full mb-6 border border-white/20"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <span>Ends in:</span>
              <CountdownDisplay endTime={endTime} />
            </div>
          </motion.div>

          {/* CTA */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-white text-red-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            Shop Now
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
