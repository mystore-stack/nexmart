/**
 * Dynamic Sitemap — NexMart SEO
 */
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";

export const revalidate = 14400;

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: { slug: string; updatedAt: Date; reviewCount: number }[] = [];
  let categories: { slug: string; createdAt: Date }[] = [];

  try {
  const organizationId = await getDefaultOrganizationId();

  [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { organizationId, published: true },
      select: { slug: true, updatedAt: true, reviewCount: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({
      where: { organizationId },
      select: { slug: true, createdAt: true },
    }),
  ]);
  } catch {
    // Build/CI without DB: static URLs only
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/categories`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE}/new-arrivals`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/brands`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/deals`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/shipping`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/returns`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/products?category=${c.slug}`,
    lastModified: c.createdAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: p.reviewCount > 10 ? 0.8 : p.reviewCount > 0 ? 0.7 : 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
