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
    (variant as string) === "primary" ? "btn-primary" :
    (variant as string) === "gold" ? "btn-gold" :
    (variant as string) === "outline" ? "btn-outline" :
    (variant as string) === "brand" ? "btn-primary" :
    (variant as string) === "destructive" ? "btn-outline text-red-600 hover:text-red-700" :
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
