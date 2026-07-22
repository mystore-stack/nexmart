// src/components/mobile/SectionHeader.tsx
import Link from "next/link";
import { cn } from "@/utils/cn";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  linkLabel?: string;
  linkHref?: string;
  className?: string;
}

/**
 * Reusable section header with optional link.
 */
export function SectionHeader({
  title,
  subtitle,
  linkLabel = "See all",
  linkHref,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div>
        {subtitle && (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
            {subtitle}
          </p>
        )}
        <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {linkHref && (
        <Link href={linkHref} className="text-xs font-semibold text-primary">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
