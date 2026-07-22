// src/app/m/categories/[slug]/page.tsx — Product listing by category (Real Data)
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMobileCategories, getMobileProductsByCategory } from "@/lib/mobile-data";
import { ProductListingClient } from "./ProductListingClient";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cats = await getMobileCategories();
  const cat = cats.find((c) => c.slug === slug);
  return { title: cat?.name ?? "Category" };
}

export async function generateStaticParams() {
  const categories = await getMobileCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const categories = await getMobileCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const products = await getMobileProductsByCategory(slug);

  return <ProductListingClient category={category} initialProducts={products} />;
}
