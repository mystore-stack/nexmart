'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'default' | 'ghost' | 'outline' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export function IconButton({ 
  icon, 
  variant = 'ghost', 
  size = 'md', 
  tooltip,
  className,
  ...props 
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const variantClasses = {
    default: 'bg-brand-500 text-white hover:bg-brand-600',
    ghost: 'hover:bg-muted text-muted-foreground hover:text-foreground',
    outline: 'border border-border/40 hover:bg-muted',
    brand: 'bg-brand-500/10 text-brand-600 hover:bg-brand-500/20'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all duration-200',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      title={tooltip}
      {...props}
    >
      {icon}
    </button>
  );
}
