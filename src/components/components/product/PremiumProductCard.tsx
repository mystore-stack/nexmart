// src/components/product/PremiumProductCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, ShoppingCart, Zap } from 'lucide-react';
import { GlassCard, Badge } from '@/components/ui/premium/GlassCard';
import { PremiumButton } from '@/components/ui/premium/PremiumButton';
import { GradientText } from '@/components/ui/premium/GlassCard';
import { cn } from '@/lib/utils';

interface PremiumProductCardProps {
  id: string;
  image: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'error' | 'info' | 'premium';
  };
  onAddToCart?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  showRating?: boolean;
}

export const PremiumProductCard: React.FC<PremiumProductCardProps> = ({
  id,
  image,
  name,
  price,
  originalPrice,
  rating = 4.5,
  reviews = 128,
  badge,
  onAddToCart,
  onFavorite,
  isFavorite = false,
  showRating = true,
}) => {
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <GlassCard variant="premium" hover className="overflow-hidden group">
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square bg-slate-900/50">
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          <Image
            src={image}
            alt={name}
            width={400}
            height={400}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
          <PremiumButton
            size="sm"
            variant="primary"
            onClick={onAddToCart}
            className="flex-1"
            icon={<ShoppingCart className="w-4 h-4" />}
          >
            Add to Cart
          </PremiumButton>
          <motion.button
            whileHover={{ scale: 1.2, rotate: 10 }}
            onClick={onFavorite}
            className={cn(
              'ml-2 p-2 rounded-full transition-colors',
              isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            )}
          >
            <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex gap-2">
          {badge && <Badge label={badge.text} variant={badge.variant} />}
          {discount > 0 && (
            <Badge label={`-${discount}%`} variant="error" icon={<Zap className="w-3 h-3" />} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <h3 className="font-semibold text-white line-clamp-2 hover:text-amber-400 transition-colors">
          {name}
        </h3>

        {/* Rating */}
        {showRating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'text-sm',
                    i < Math.floor(rating) ? 'text-amber-400' : 'text-slate-600'
                  )}
                >
                  ★
                </motion.span>
              ))}
            </div>
            <span className="text-xs text-slate-400">({reviews} reviews)</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <GradientText gradient="gold" className="text-2xl font-bold">
            ${price.toFixed(2)}
          </GradientText>
          {originalPrice && (
            <span className="text-sm text-slate-500 line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Quick Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={onAddToCart}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 text-white font-semibold text-sm hover:shadow-lg transition-all"
        >
          Add to Cart
        </motion.button>
      </div>
    </GlassCard>
  );
};
