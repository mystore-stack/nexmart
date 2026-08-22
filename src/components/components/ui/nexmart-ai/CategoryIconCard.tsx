"use client";

import Link from "next/link";
import React from "react";
import {
  Gem,
  Home,
  Lamp,
  Package,
  Shirt,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { SmartEmptyState } from "./SmartEmptyState";

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Shirt,
  Gem,
  Lamp,
  Smartphone,
  Sparkles,
  Package,
};

type CategoryIconCardProps = {
  id: string;
  name: string;
  href: string;
  icon?: string;
  count?: number;
  empty?: boolean;
};

export function CategoryIconCard({ id, name, href, icon = "Package", count, empty = false }: CategoryIconCardProps) {
  if (empty) {
    return (
      <SmartEmptyState
        variant="card"
        message="Content will adapt here"
        submessage="This category slot is ready for AI-curated content"
        className="min-h-[160px]"
      />
    );
  }

  const Icon = ICON_MAP[icon] ?? Package;

  return (
    <Link
      href={href}
      className="ai-card group flex flex-col items-center gap-4 p-6 text-center"
      key={id}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--ai-purple)/0.08)] transition group-hover:bg-[hsl(var(--ai-purple)/0.14)]">
        <Icon className="h-6 w-6 text-[hsl(var(--ai-purple))]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[hsl(222_47%_10%)]">{name}</p>
        {count !== undefined && (
          <p className="mt-1 text-xs text-[hsl(var(--ai-muted))]">{count} produits</p>
        )}
      </div>
    </Link>
  );
}
