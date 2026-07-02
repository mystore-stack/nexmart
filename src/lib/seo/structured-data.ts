export function generateProductStructuredData({
  product,
}: {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    comparePrice?: number | null;
    images: string[];
    slug: string;
    category?: string;
    brand?: string;
    sku?: string;
    stock?: number;
    rating?: number;
    reviewCount?: number;
  };
}) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nexmart.ma";
  const url = `${SITE_URL}/products/${product.slug}`;
  const imageUrl = product.images[0] || `${SITE_URL}/og-image.png`;

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: product.brand || "NexMart",
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "MAD",
      price: product.price.toFixed(2),
      availability: product.stock && product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      ...(product.comparePrice && {
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    },
    ...(product.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
      },
    }),
  };

  return JSON.stringify(structuredData);
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nexmart.ma";

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return JSON.stringify(structuredData);
}

export function generateOrganizationStructuredData() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nexmart.ma";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NexMart Maroc",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "Premium marketplace for authentic Moroccan products",
    address: {
      "@type": "PostalAddress",
      addressCountry: "MA",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+212-XXX-XXX-XXX",
      contactType: "customer service",
    },
    sameAs: [
      "https://facebook.com/nexmart",
      "https://instagram.com/nexmart",
      "https://twitter.com/nexmart",
    ],
  };

  return JSON.stringify(structuredData);
}

export function generateWebSiteStructuredData() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nexmart.ma";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NexMart Maroc",
    url: SITE_URL,
    description: "Premium marketplace for authentic Moroccan products",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return JSON.stringify(structuredData);
}
