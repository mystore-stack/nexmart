// src/components/ui/premium/GlassCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'premium';
  hover?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'premium',
  hover = true,
  onClick,
}) => {
  const variants = {
    light: 'bg-white/50 backdrop-blur-lg border border-white/20',
    dark: 'bg-slate-900/50 backdrop-blur-lg border border-slate-700/30',
    premium: 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20',
  };

  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cn(
        'rounded-2xl shadow-glass overflow-hidden',
        'transition-all duration-300',
        hover && 'cursor-pointer',
        variants[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
};

// Gradient Text Component
interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'gold' | 'purple' | 'ocean' | 'fire' | 'emerald';
  animated?: boolean;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className,
  gradient = 'gold',
  animated = false,
}) => {
  const gradients = {
    gold: 'from-amber-400 to-amber-600',
    purple: 'from-purple-400 to-pink-600',
    ocean: 'from-cyan-400 to-blue-600',
    fire: 'from-orange-400 to-red-600',
    emerald: 'from-emerald-400 to-teal-600',
  };

  return (
    <motion.span
      animate={animated ? { scale: [1, 1.05, 1] } : undefined}
      transition={{ duration: 2, repeat: Infinity }}
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent font-bold',
        `${gradients[gradient]}`,
        className
      )}
    >
      {children}
    </motion.span>
  );
};

// Premium Badge
interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'premium';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'info',
  icon,
}) => {
  const variants = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    premium: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-md',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
        variants[variant]
      )}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {label}
    </span>
  );
};
