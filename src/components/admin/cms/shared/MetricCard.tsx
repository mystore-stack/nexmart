"use client";

import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  BellRing,
  Image,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

export type MetricCardIconName =
  | "activity"
  | "bar-chart"
  | "bell"
  | "image"
  | "megaphone";

const ICONS: Record<MetricCardIconName, LucideIcon> = {
  activity: Activity,
  "bar-chart": BarChart3,
  bell: BellRing,
  image: Image,
  megaphone: Megaphone,
};

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon | MetricCardIconName;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  className,
}: MetricCardProps) {
  const ResolvedIcon = typeof Icon === "string" ? ICONS[Icon] : Icon;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                changeType === "positive" && "text-green-600",
                changeType === "negative" && "text-red-600",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        {ResolvedIcon && (
          <div className="rounded-lg bg-primary/10 p-2.5">
            <ResolvedIcon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
