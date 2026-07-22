// src/app/m/products/page.tsx — All Products (Real Data)
import type { Metadata } from "next";
import { getMobileAllProducts } from "@/lib/mobile-data";
import { AllProductsClient } from "./AllProductsClient";

export const metadata: Metadata = { title: "All Products" };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getMobileAllProducts("popular");
  return <AllProductsClient initialProducts={products} />;
}
