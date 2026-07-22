// src/components/mobile/StockBar.tsx
import { cn } from "@/utils/cn";

interface StockBarProps {
  current: number;
  max: number;
  lowThreshold?: number;
  className?: string;
}

/**
 * Stock progress bar — shows urgency when stock is low.
 */
export function StockBar({ current, max, lowThreshold = 10, className }: StockBarProps) {
  const pct = Math.round((current / max) * 100);
  const isLow = current <= lowThreshold;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span className={cn("font-semibold", isLow && "text-red-500")}>
          {isLow && "🔥 "}Only {current} left
        </span>
        <span>{max} total</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isLow
              ? "bg-gradient-to-r from-red-400 to-orange-400"
              : "bg-gradient-to-r from-primary to-emerald-400"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
