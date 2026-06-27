import { BundleDeals } from "./BundleDeals";
import { prisma } from "@/lib/prisma";

async function getBundlesData() {
  try {
    // Get active bundle deals
    const bundleDeals = await (prisma as any).bundleDeal.findMany({
      where: {
        enabled: true,
      },
      include: {
        products: {
          include: {
            product: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return bundleDeals.map((bundle: any) => ({
      id: bundle.id,
      name: bundle.name,
      description: bundle.description,
      bundlePrice: bundle.bundlePrice,
      discountPercent: bundle.discountPercent,
      backgroundColor: bundle.backgroundColor,
      gradient: bundle.gradient,
      buttonText: bundle.buttonText,
      buttonUrl: bundle.buttonUrl,
      products: bundle.products
        .filter((bp: any) => bp.product && bp.product.published)
        .map((bp: any) => ({
          id: bp.product.id,
          name: bp.product.name,
          slug: bp.product.slug,
          image: bp.product.images[0],
          price: bp.product.price,
        })),
    }));
  } catch (error) {
    console.error("[BUNDLE_DEALS_ERROR]", error);
    return [];
  }
}

export async function BundleDealsServer() {
  const bundles = await getBundlesData();
  
  if (bundles.length === 0) {
    return <></>;
  }
  
  return <BundleDeals bundles={bundles} />;
}
