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
