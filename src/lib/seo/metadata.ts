import type { Metadata } from "next";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: "website" | "article";
  canonical?: string;
  noIndex?: boolean;
  locale?: string;
}

const SITE_NAME = "NexMart Maroc";
const DEFAULT_LOCALE = "fr_MA";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nexmart.ma";

export function generateSEOMetadata({
  title,
  description,
  keywords,
  ogImage,
  ogType = "website",
  canonical,
  noIndex = false,
  locale = DEFAULT_LOCALE,
}: SEOProps): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = canonical ? `${SITE_URL}${canonical}` : SITE_URL;
  const defaultOgImage = `${SITE_URL}/og-image.png`;

  return {
    title: fullTitle,
    description,
    keywords: keywords?.join(", "),
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
    openGraph: {
      type: ogType,
      locale,
      url,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage || defaultOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage || defaultOgImage],
      creator: "@nexmart",
    },
    alternates: {
      canonical: url,
    },
    ...(noIndex && {
      other: {
        "X-Robots-Tag": "noindex, nofollow",
      },
    }),
  };
}

export function generateProductSEOMetadata({
  product,
}: {
  product: {
    name: string;
    description: string;
    price: number;
    comparePrice?: number | null;
    images: string[];
    slug: string;
    category?: string;
  };
}): Metadata {
  const url = `${SITE_URL}/products/${product.slug}`;
  const ogImage = product.images[0] || `${SITE_URL}/og-image.png`;
  
  return generateSEOMetadata({
    title: product.name,
    description: product.description,
    ogImage,
    ogType: "website",
    canonical: `/products/${product.slug}`,
  });
}

export function generateCategorySEOMetadata({
  category,
}: {
  category: {
    name: string;
    description?: string;
    slug: string;
    image?: string;
  };
}): Metadata {
  const title = `${category.name} - Products`;
  const description = category.description || `Browse our collection of ${category.name} products at ${SITE_NAME}.`;
  
  return generateSEOMetadata({
    title,
    description,
    ogImage: category.image,
    canonical: `/categories/${category.slug}`,
  });
}

export function generateArticleSEOMetadata({
  article,
}: {
  article: {
    title: string;
    description: string;
    image?: string;
    slug: string;
    publishedAt: string;
    author?: string;
  };
}): Metadata {
  const url = `${SITE_URL}/blog/${article.slug}`;
  
  return {
    ...generateSEOMetadata({
      title: article.title,
      description: article.description,
      ogImage: article.image,
      ogType: "article",
      canonical: `/blog/${article.slug}`,
    }),
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.description,
      siteName: SITE_NAME,
      publishedTime: article.publishedAt,
      authors: article.author ? [article.author] : undefined,
    },
  };
}
