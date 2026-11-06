"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * NexMart — Mobile Section Header
 * Phase 1 — Design System Component
 */

interface MobileSectionHeaderProps {
  title: string;
  titleAr?: string;
  linkLabel?: string;
  linkHref?: string;
  locale?: "fr" | "ar";
  className?: string;
  action?: ReactNode;
}

export function MobileSectionHeader({
  title,
  titleAr,
  linkLabel = "Voir tout",
  linkHref,
  locale = "fr",
  className = "",
  action,
}: MobileSectionHeaderProps) {
  const displayTitle = locale === "ar" && titleAr ? titleAr : title;

  return (
    <div className={`nm-section-header ${className}`}>
      <h2 className="nm-section-title">{displayTitle}</h2>
      {action && action}
      {!action && linkHref && (
        <Link href={linkHref} className="nm-section-link" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {locale === "ar" ? "عرض الكل" : linkLabel}
          {locale === "ar" ? (
            <ChevronLeft size={14} strokeWidth={2.5} />
          ) : (
            <ChevronRight size={14} strokeWidth={2.5} />
          )}
        </Link>
      )}
    </div>
  );
}

/**
 * NexMart — Mobile Category Card
 * Phase 1 — Design System Component
 */

interface MobileCategoryCardProps {
  id: string;
  name: string;
  image?: string;
  slug: string;
  productCount?: number;
  color?: string;
  locale?: "fr" | "ar";
}

export function MobileCategoryCard({
  name,
  image,
  slug,
  color = "#EDF0ED",
}: MobileCategoryCardProps) {
  return (
    <Link href={`/category/${slug}`} className="nm-category-card" style={{ textDecoration: "none" }}>
      <div
        className="nm-category-card__icon"
        style={{ background: image ? undefined : color }}
      >
        {image ? (
          <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: "28px" }}>🛍️</span>
        )}
      </div>
      <span className="nm-category-card__label">{name}</span>
    </Link>
  );
}

/**
 * NexMart — Mobile Empty State
 * Phase 1 — Design System Component
 */

interface MobileEmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function MobileEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
}: MobileEmptyStateProps) {
  return (
    <div className="nm-empty-state">
      {icon && <div className="nm-empty-state__icon">{icon}</div>}
      <p className="nm-empty-state__title">{title}</p>
      {description && <p className="nm-empty-state__desc">{description}</p>}
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref} className="nm-btn nm-btn--primary" style={{ width: "auto", marginTop: "8px" }}>
            {actionLabel}
          </Link>
        ) : (
          <button className="nm-btn nm-btn--primary" onClick={onAction} style={{ width: "auto", marginTop: "8px" }}>
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}

/**
 * NexMart — Mobile Skeleton Loader
 * Phase 1 — Design System Component
 */

interface MobileSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export function MobileSkeleton({ width = "100%", height = "16px", borderRadius = "8px", className = "" }: MobileSkeletonProps) {
  return (
    <div
      className={`nm-skeleton ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}

export function MobileProductCardSkeleton() {
  return (
    <div style={{ width: "180px", flexShrink: 0 }}>
      <MobileSkeleton height="225px" borderRadius="16px" />
      <div style={{ padding: "10px 4px 0", display: "flex", flexDirection: "column", gap: "6px" }}>
        <MobileSkeleton height="14px" width="90%" />
        <MobileSkeleton height="14px" width="60%" />
        <MobileSkeleton height="18px" width="45%" />
      </div>
    </div>
  );
}

/**
 * NexMart — Mobile Chip
 * Phase 1 — Design System Component
 */

interface MobileChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
}

export function MobileChip({ label, active, onClick, icon }: MobileChipProps) {
  return (
    <button
      className={`nm-chip${active ? " active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {icon && icon}
      {label}
    </button>
  );
}

/**
 * NexMart — Mobile NexPoints Badge
 * Phase 1 — Design System Component
 */

interface NexPointsBadgeProps {
  points: number;
  size?: "sm" | "md" | "lg";
}

export function NexPointsBadge({ points, size = "md" }: NexPointsBadgeProps) {
  const sizeMap = {
    sm: { fontSize: "12px", padding: "4px 10px", iconSize: "14px" },
    md: { fontSize: "14px", padding: "6px 14px", iconSize: "16px" },
    lg: { fontSize: "18px", padding: "10px 20px", iconSize: "22px" },
  };
  const s = sizeMap[size];

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      background: "linear-gradient(135deg, #D4AF37 0%, #F5CC3A 100%)",
      borderRadius: "9999px",
      padding: s.padding,
      fontSize: s.fontSize,
      fontWeight: 700,
      color: "#0C1F1B",
    }}>
      <svg width={s.iconSize} height={s.iconSize} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {points.toLocaleString("fr-MA")} pts
    </div>
  );
}
