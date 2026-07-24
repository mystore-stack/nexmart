import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'primary', size = 'md', className = '', children, ...rest }, ref) => {
  const base = 'inline-flex items-center justify-center font-medium rounded';
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-5 py-3 text-lg' : 'px-4 py-2 text-base';

  const variantClass =
    variant === 'primary'
      ? 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent200)] shadow-md'
      : variant === 'secondary'
      ? 'bg-[var(--color-surface)] border border-[var(--color-muted)] text-[var(--color-primary)]'
      : 'bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-backdrop)]/6';

  return (
    <button ref={ref} className={`${base} ${sizeClass} ${variantClass} ${className}`} {...rest}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
// src/components/ui/Button.tsx — Moroccan Premium Buttons
import React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";

type Variant = "primary" | "gold" | "outline" | "ghost" | "brand";
type Size = "lg" | "md" | "sm";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asLink?: string;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = "primary", size = "md",
  className, asLink, loading, disabled, ...rest
}) => {
  const variantClass =
    variant === "primary" ? "btn-primary" :
    variant === "gold" ? "btn-gold" :
    variant === "outline" ? "btn-outline" :
    variant === "brand" ? "btn-primary" :
    "btn-ghost";
  const sizeClass = size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : "btn-md";
  const classes = cn("btn", variantClass, sizeClass, className, loading ? "loading" : "");

  if (asLink) {
    return (
      <Link href={asLink} className={classes} {...(rest as any)} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading ? <span className="opacity-0">{children}</span> : children}
    </button>
  );
};

export default Button;
