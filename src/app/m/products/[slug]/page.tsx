// src/app/m/products/[slug]/page.tsx — Product Details (Real Data)
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMobileProduct, getMobileRelatedProducts } from "@/lib/mobile-data";
import { ProductDetailClient } from "./ProductDetailClient";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getMobileProduct(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getMobileProduct(slug);
  if (!product) notFound();

  const related = await getMobileRelatedProducts(product.id, product.categoryId);

  return <ProductDetailClient product={product} related={related} />;
}
