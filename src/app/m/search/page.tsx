// src/app/m/search/page.tsx — Search page stub
import type { Metadata } from "next";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import Link from "next/link";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <MobileLayout>
      <header className="flex items-center gap-3 px-4 py-4 sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <Link href="/m" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center" aria-label="Back">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <input type="text" placeholder="Search products…" className="input-luxury flex-1 text-sm" autoFocus />
      </header>
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <p className="text-muted-foreground text-sm">Search functionality coming soon.</p>
      </div>
    </MobileLayout>
  );
}
