"use client"

import React from "react";
import { cn } from "@/lib/utils";

export interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, open, onOpenChange }) => {
  return <div className="relative">{children}</div>;
};

export const DropdownMenuTrigger: React.FC<{ children: React.ReactNode; asChild?: boolean }> = ({ children }) => {
  return <>{children}</>;
};

export const DropdownMenuContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={cn("absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg border border-gray-200 z-50", className)}>
      {children}
    </div>
  );
};

export const DropdownMenuItem: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({ children, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn("w-full text-left px-4 py-2 hover:bg-gray-100 text-sm", className)}
    >
      {children}
    </button>
  );
};

export const DropdownMenuSeparator: React.FC = () => {
  return <div className="h-px bg-gray-200 my-1" />;
};

export const DropdownMenuLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <div className={cn("px-4 py-2 font-semibold text-sm", className)}>{children}</div>;
};
