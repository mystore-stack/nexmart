import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductReviews } from "@/components/product/ProductReviews";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import type { Product } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  const organizationId = await getDefaultOrganizationId();
  const cached = await getCache<Product>(CACHE_KEYS.productSlug(slug));
  if (cached) return cached;

  const product = await prisma.product.findFirst({
    where: { organizationId, slug, published: true },
    include: {
      category: true,
      variants: true,
      reviews: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!product) return null;
  await setCache(CACHE_KEYS.productSlug(slug), product, CACHE_TTL.MEDIUM);
  return product as unknown as Product;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: [{ url: product.images[0], width: 800, height: 800, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      images: [product.images[0]],
    },
  };
}

export async function generateStaticParams() {
  return [];
}

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const organizationId = await getDefaultOrganizationId();

  const related = await prisma.product.findMany({
    where: {
      organizationId,
      categoryId: product.categoryId,
      id: { not: product.id },
      published: true,
    },
    include: { category: true, variants: true },
    orderBy: { soldCount: "desc" },
    take: 6,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    brand: { "@type": "Organization", name: "NexMart" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "MAD",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="page-enter">
        <div className="border-b border-border">
          <div className="container-main py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">
                Home
              </a>
              <span>/</span>
              <a
                href="/products"
                className="hover:text-foreground transition-colors"
              >
                Products
              </a>
              <span>/</span>
              <a
                href={`/products?category=${product.category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {product.category.name}
              </a>
              <span>/</span>
              <span className="text-foreground truncate max-w-[200px]">
                {product.name}
              </span>
            </nav>
          </div>
        </div>

        <div className="container-main py-8 md:py-12">
          <div className="grid lg:grid-cols-2 gap-8 xl:gap-16">
            <ProductGallery images={product.images} name={product.name} />
            <ProductInfo product={product} />
          </div>
        </div>

        <div className="border-t border-border">
          <div className="container-main py-12">
            <Suspense
              fallback={<div className="skeleton h-64 rounded-2xl" />}
            >
              <ProductReviews
                productId={product.id}
                initialReviews={(product as any).reviews || []}
                rating={product.rating}
                reviewCount={product.reviewCount}
              />
            </Suspense>
          </div>
        </div>

        {related.length > 0 && (
          <div className="border-t border-border bg-surface">
            <div className="container-main py-12">
              <RelatedProducts
                products={related as unknown as Product[]}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

