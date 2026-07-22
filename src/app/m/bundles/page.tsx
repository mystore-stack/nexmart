// src/app/m/bundles/page.tsx — Bundle Deals list (Real Data)
import type { Metadata } from "next";
import { getMobileBundles } from "@/lib/mobile-data";
import { BundlesPageClient } from "./BundlesPageClient";

export const metadata: Metadata = { title: "Bundle Deals" };
export const revalidate = 3600;

export default async function BundlesPage() {
  const bundles = await getMobileBundles();

  return <BundlesPageClient bundles={bundles} />;
}
