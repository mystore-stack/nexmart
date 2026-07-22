// src/components/mobile/index.ts — barrel export
export { Hero } from "./Hero";
export { SmartCategories, CategoryGrid } from "./Categories";
export type { SmartCategory, VisualCategory } from "./Categories";
export { FeaturedProducts } from "./FeaturedProducts";
export type { Product as MobileProduct } from "./FeaturedProducts";
export { Deals } from "./Deals";
export type { Deal as MobileDeal } from "./Deals";
export { Bundle } from "./Bundle";
export type { BundleItem } from "./Bundle";
export { MysteryBox } from "./MysteryBox";

// Shared UI components
export { MobileLayout } from "./MobileLayout";
export { MobileNav } from "./MobileNav";
export { ProductCard } from "./ProductCard";
export { DealCard } from "./DealCard";
export { CategoryCard } from "./CategoryCard";
export { SectionHeader } from "./SectionHeader";
export { FilterBar } from "./FilterBar";
export { CountdownTimer } from "./CountdownTimer";
export { StockBar } from "./StockBar";
