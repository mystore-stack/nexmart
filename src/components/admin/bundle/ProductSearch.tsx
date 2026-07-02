"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ProductSearch({ 
  value, 
  onChange, 
  placeholder = "Search products by name, SKU, or tags...",
  disabled = false 
}: ProductSearchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
