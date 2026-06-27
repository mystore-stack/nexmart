import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma";

  const [products, categories, pages] = await Promise.all([
    prisma.product.findMany({
      where: { published: true },
      select: { id: true, slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      select: { id: true, slug: true, updatedAt: true },
    }),
    prisma.page.findMany({
      where: { published: true },
      select: { id: true, slug: true, updatedAt: true },
    }).catch(() => []),
  ]);

  const staticPages = [
    { url: "", lastmod: new Date() },
    { url: "/products", lastmod: new Date() },
    { url: "/categories", lastmod: new Date() },
    { url: "/about", lastmod: new Date() },
    { url: "/contact", lastmod: new Date() },
    { url: "/faq", lastmod: new Date() },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("")}
  ${products
    .map(
      (product) => `
  <url>
    <loc>${baseUrl}/products/${product.slug}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join("")}
  ${categories
    .map(
      (category) => `
  <url>
    <loc>${baseUrl}/categories/${category.slug}</loc>
    <lastmod>${category.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("")}
  ${pages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <lastmod>${page.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
