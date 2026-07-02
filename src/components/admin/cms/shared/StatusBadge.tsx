import { cn } from "@/lib/utils";
import type { CMSContentStatus } from "@prisma/client";
import { CMS_STATUS_LABELS } from "@/lib/cms/constants";

interface StatusBadgeProps {
  status: CMSContentStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = CMS_STATUS_LABELS[status as keyof typeof CMS_STATUS_LABELS] ?? {
    label: status,
    color: "bg-gray-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white",
        config.color,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
      {config.label}
    </span>
  );
}
