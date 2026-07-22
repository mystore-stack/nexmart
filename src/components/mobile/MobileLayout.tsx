// src/components/mobile/MobileLayout.tsx
import { cn } from "@/utils/cn";
import { MobileNav } from "./MobileNav";

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  showNav?: boolean;
}

/**
 * Main mobile container: max-width viewport, bottom nav, centered on desktop.
 */
export function MobileLayout({
  children,
  className,
  showNav = true,
}: MobileLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-sm bg-background min-h-screen flex flex-col">
      <main className={cn("flex-1 pb-20", className)}>
        {children}
      </main>
      {showNav && <MobileNav />}
    </div>
  );
}
