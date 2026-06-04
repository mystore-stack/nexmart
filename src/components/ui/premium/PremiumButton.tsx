// src/components/ui/premium/PremiumButton.tsx
'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumButtonProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    MotionProps {
  variant?: 
    | 'primary' 
    | 'secondary' 
    | 'outline' 
    | 'ghost' 
    | 'gradient' 
    | 'glass' 
    | 'neon';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-lg hover:shadow-xl',
  secondary: 'bg-slate-700 text-white hover:bg-slate-800',
  outline: 'border-2 border-amber-500 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  gradient: 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-lg',
  glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
  neon: 'bg-black text-amber-400 border border-amber-400 shadow-neon hover:shadow-lg',
};

const sizeStyles = {
  xs: 'px-2.5 py-1.5 text-xs font-medium rounded-md',
  sm: 'px-3 py-2 text-sm font-medium rounded-lg',
  md: 'px-4 py-2.5 text-base font-semibold rounded-lg',
  lg: 'px-6 py-3 text-lg font-semibold rounded-xl',
  xl: 'px-8 py-4 text-xl font-bold rounded-2xl',
};

export const PremiumButton = React.forwardRef<
  HTMLButtonElement,
  PremiumButtonProps
>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      icon,
      iconPosition = 'left',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98, y: 0 }}
        disabled={isLoading || disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
        )}
        {icon && iconPosition === 'left' && !isLoading && icon}
        {children}
        {icon && iconPosition === 'right' && !isLoading && icon}
      </motion.button>
    );
  }
);

PremiumButton.displayName = 'PremiumButton';
