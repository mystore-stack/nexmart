// src/components/home/PremiumHero.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PremiumButton } from '@/components/ui/premium/PremiumButton';
import { GradientText } from '@/components/ui/premium/GlassCard';
import { ArrowRight, Sparkles } from 'lucide-react';

interface PremiumHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  backgroundImage?: string;
  variant?: 'primary' | 'secondary' | 'ai';
}

export const PremiumHero: React.FC<PremiumHeroProps> = ({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  backgroundImage,
  variant = 'primary',
}) => {
  const bgGradients = {
    primary:
      'from-slate-900 via-purple-900 to-slate-900',
    secondary:
      'from-slate-900 via-slate-800 to-black',
    ai: 'from-black via-purple-900/20 to-black',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section
      className={`relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br ${bgGradients[variant]}`}
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage}), linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.7))`,
              backgroundBlend: 'overlay',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Blobs */}
        <motion.div
          animate={{
            x: [-100, 100],
            y: [-100, 100],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [100, -100],
            y: [100, -100],
            rotate: [360, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-600/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          {variant === 'ai' && (
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/50 mb-6">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-300">
                  Powered by AI
                </span>
              </div>
            </motion.div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              variants={itemVariants}
              className="text-sm md:text-base font-semibold text-amber-400 mb-4"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            {title.split(' ').map((word, idx) => (
              <span key={idx}>
                {idx === title.split(' ').length - 1 ? (
                  <GradientText gradient="gold" className="text-5xl md:text-6xl lg:text-7xl">
                    {word}
                  </GradientText>
                ) : (
                  <span>{word} </span>
                )}
              </span>
            ))}
          </motion.h1>

          {/* Description */}
          {description && (
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed"
            >
              {description}
            </motion.p>
          )}

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {primaryCTA && (
              <PremiumButton
                size="lg"
                variant="primary"
                className="group"
              >
                {primaryCTA.text}
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </PremiumButton>
            )}
            {secondaryCTA && (
              <PremiumButton
                size="lg"
                variant="glass"
              >
                {secondaryCTA.text}
              </PremiumButton>
            )}
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="mt-16 text-slate-400 text-sm font-semibold"
          >
            ↓ Scroll to explore
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
