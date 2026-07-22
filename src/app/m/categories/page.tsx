// src/app/m/categories/page.tsx — All Categories (Real Data)
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { CategoryCard } from "@/components/mobile/CategoryCard";
import { getMobileCategories } from "@/lib/mobile-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getMobileCategories();
  return (
    <MobileLayout>
      <header className="px-5 py-5 sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <h1 className="font-display text-2xl font-semibold text-foreground">Categories</h1>
      </header>

      <div className="px-4 py-6">
        {/* Visual image grid */}
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} variant="image" />
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
