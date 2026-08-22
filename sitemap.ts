/**
 * Dynamic Sitemap — NexMart Enterprise SEO
 * Generates 50k+ URLs for Google indexation:
 * - All published products
 * - All categories
 * - Static pages
 * Updates every 4 hours via ISR revalidation
 */
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";

export const revalidate = 14400; // 4h

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const organizationId = await getDefaultOrganizationId();

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { organizationId, published: true },
      select: { slug: true, updatedAt: true, rating: true, reviewCount: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({
      where: { organizationId },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                        lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/products`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/deals`,             lastModified: new Date(), changeFrequency: "hourly",  priority: 0.8 },
    { url: `${BASE}/register`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/login`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/about`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contact`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/shipping`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/returns`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/privacy`,           lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/terms`,             lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url:             `${BASE}/products?category=${c.slug}`,
    lastModified:    c.updatedAt,
    changeFrequency: "daily",
    priority:        0.8,
  }));

  // Product pages — higher priority for popular products
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url:             `${BASE}/products/${p.slug}`,
    lastModified:    p.updatedAt,
    changeFrequency: "weekly",
    priority:        p.reviewCount > 10 ? 0.8 : p.reviewCount > 0 ? 0.7 : 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
