import { prisma } from "@/lib/prisma";

export async function generateHomepageMetadata(organizationId: string) {
  try {
    const builder = await prisma.homepageBuilder.findFirst({
      where: { organizationId, isActive: true },
      include: {
        sections: {
          where: { isEnabled: true, publishStatus: "PUBLISHED" },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!builder) {
      return {
        title: "NexMart Morocco - Premium E-commerce",
        description: "Discover premium products from exclusive brands in Morocco",
        keywords: "ecommerce, shopping, morocco, luxury, premium",
        ogImage: "/images/og-default.jpg",
      };
    }

    // Extract SEO data from sections
    const heroSection = builder.sections.find(
      (s) => s.sectionType === "PROFESSIONAL_HERO"
    );
    const heroConfig = heroSection?.config as any;

    const title = heroConfig?.seoTitle || builder.name;
    const description = heroConfig?.seoDescription || "Discover premium products from exclusive brands in Morocco";
    const keywords = "ecommerce, shopping, morocco, luxury, premium, nexmart";

    return {
      title,
      description,
      keywords,
      ogImage: heroConfig?.desktopImage || "/images/og-default.jpg",
      twitterCard: "summary_large_image",
    };
  } catch (error) {
    console.error("Error generating homepage metadata:", error);
    return {
      title: "NexMart Morocco - Premium E-commerce",
      description: "Discover premium products from exclusive brands in Morocco",
      keywords: "ecommerce, shopping, morocco, luxury, premium",
      ogImage: "/images/og-default.jpg",
    };
  }
}

export async function generateStructuredData(organizationId: string) {
  try {
    const builder = await prisma.homepageBuilder.findFirst({
      where: { organizationId, isActive: true },
      include: {
        sections: {
          where: { isEnabled: true, publishStatus: "PUBLISHED" },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!builder) return null;

    // Generate Organization structured data
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: organization?.name || "NexMart",
      url: organization?.website || "https://nexmart.ma",
      logo: organization?.logo || "/images/logo.png",
      description: organization?.description || "Premium e-commerce platform in Morocco",
      address: organization?.address || {
        "@type": "PostalAddress",
        addressCountry: "MA",
        addressLocality: "Casablanca",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: organization?.phone || "+212 522 123 456",
        contactType: "customer service",
      },
    };

    // Generate Product structured data from product sections
    const productSections = builder.sections.filter((s) =>
      ["SPONSORED_PRODUCTS", "FLASH_DEALS", "BEST_SELLERS"].includes(s.sectionType)
    );

    const productSchemas = productSections.map((section) => {
      const config = section.config as any;
      const products = config?.products || [];

      return products.map((product: any) => ({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.image,
        description: product.description,
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "MAD",
          availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      }));
    }).flat();

    return {
      organization: orgSchema,
      products: productSchemas,
    };
  } catch (error) {
    console.error("Error generating structured data:", error);
    return null;
  }
}

export async function generateSitemap(organizationId: string) {
  try {
    const builder = await prisma.homepageBuilder.findFirst({
      where: { organizationId, isActive: true },
      include: {
        sections: {
          where: { isEnabled: true, publishStatus: "PUBLISHED" },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    const sitemap = [
      {
        url: "https://nexmart.ma",
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
      },
      {
        url: "https://nexmart.ma/products",
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: "https://nexmart.ma/categories",
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: "https://nexmart.ma/deals",
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
    ];

    return sitemap;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return [];
  }
}

export async function optimizeImages(sectionConfig: any) {
  // Generate optimized image URLs with Cloudinary transformations
  const optimizedConfig = { ...sectionConfig };

  if (optimizedConfig.desktopImage) {
    optimizedConfig.desktopImage = addImageOptimization(optimizedConfig.desktopImage, 1920, 1080);
  }
  if (optimizedConfig.tabletImage) {
    optimizedConfig.tabletImage = addImageOptimization(optimizedConfig.tabletImage, 1024, 768);
  }
  if (optimizedConfig.mobileImage) {
    optimizedConfig.mobileImage = addImageOptimization(optimizedConfig.mobileImage, 640, 960);
  }

  return optimizedConfig;
}

function addImageOptimization(url: string, width: number, height: number): string {
  // In a real implementation, this would add Cloudinary transformation parameters
  // Example: https://res.cloudinary.com/your-cloud/image/upload/w_1920,h_1080,q_auto,f_auto/image.jpg
  return url;
}

export async function generateAccessibilityAttributes(sectionType: string, config: any) {
  const accessibility = {
    role: "region",
    ariaLabel: "",
    ariaDescribedBy: "",
    skipLink: false,
  };

  switch (sectionType) {
    case "PROFESSIONAL_HERO":
      accessibility.ariaLabel = "Main hero section";
      accessibility.skipLink = true;
      break;
    case "FLASH_DEALS":
      accessibility.ariaLabel = "Flash deals section";
      break;
    case "POPULAR_CATEGORIES":
      accessibility.ariaLabel = "Popular categories navigation";
      accessibility.role = "navigation";
      break;
    case "TESTIMONIALS":
      accessibility.ariaLabel = "Customer testimonials";
      break;
    case "NEWSLETTER":
      accessibility.ariaLabel = "Newsletter subscription";
      break;
    default:
      accessibility.ariaLabel = `${sectionType.replace(/_/g, " ").toLowerCase()} section`;
  }

  return accessibility;
}
