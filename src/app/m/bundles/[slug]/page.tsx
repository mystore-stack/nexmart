// src/app/m/bundles/[slug]/page.tsx — Bundle Detail (Real Data)
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMobileBundles } from "@/lib/mobile-data";
import { BundleDetailClient } from "./BundleDetailClient";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bundles = await getMobileBundles();
  const bundle = bundles.find((b) => b.slug === slug);
  return { title: bundle?.name ?? "Bundle" };
}

export default async function BundleDetailPage({ params }: Props) {
  const { slug } = await params;
  const bundles = await getMobileBundles();
  const bundle = bundles.find((b) => b.slug === slug);
  if (!bundle) notFound();

  return <BundleDetailClient bundle={bundle} />;
}
