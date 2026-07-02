import React from "react";
import { Plus } from "lucide-react";

interface AddSectionButtonProps {
  onClick: () => void;
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function AddSectionButton({
  onClick,
  label = "Add Section",
  variant = "primary",
  size = "md",
  fullWidth = false,
}: AddSectionButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all hover:scale-105";

  const variantStyles = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-md",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-300",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""}`}
    >
      <Plus className="w-5 h-5" />
      {label}
    </button>
  );
}
