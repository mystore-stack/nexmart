import { SuperDeals } from "./SuperDeals";
import { prisma } from "@/lib/prisma";

async function getDealsData() {
  try {
    const now = new Date();
    
    // Get active super deals
    const superDeals = await (prisma as any).superDeal.findMany({
      where: {
        enabled: true,
        OR: [
          {
            startDate: null,
          },
          {
            startDate: {
              lte: now,
            },
          },
        ],
        AND: [
          {
            OR: [
              {
                endDate: null,
              },
              {
                endDate: {
                  gte: now,
                },
              },
            ],
          },
        ],
      },
      include: {
        product: true,
      },
      orderBy: [
        { featured: "desc" },
        { order: "asc" },
      ],
    });

    return superDeals
      .filter((deal: any) => deal.product && deal.product.published)
      .map((deal: any) => {
        // Calculate deal price based on discount type
        let dealPrice = deal.dealPrice;
        if (!dealPrice && deal.discountType === "PERCENTAGE" && deal.discountValue > 0) {
          dealPrice = deal.product.price * (1 - deal.discountValue / 100);
        } else if (!dealPrice && deal.discountType === "FIXED_AMOUNT" && deal.discountValue > 0) {
          dealPrice = deal.product.price - deal.discountValue;
        }

        return {
          id: deal.id,
          product: {
            id: deal.product.id,
            name: deal.product.name,
            slug: deal.product.slug,
            image: deal.image || deal.product.images[0],
            price: deal.product.price,
            comparePrice: deal.originalPrice || deal.product.comparePrice,
            rating: deal.product.rating,
            soldCount: deal.product.soldCount,
          },
          dealPrice: dealPrice || deal.product.price,
          discountType: deal.discountType,
          discountValue: deal.discountValue,
          endDate: deal.endDate?.toISOString(),
          countdown: deal.countdown,
          featured: deal.featured,
          flashSale: deal.flashSale,
          backgroundColor: deal.backgroundColor,
          gradient: deal.gradient,
          buttonText: deal.buttonText,
          buttonUrl: deal.buttonUrl,
          title: deal.title,
          description: deal.description,
        };
      });
  } catch (error) {
    console.error("[SUPER_DEALS_ERROR]", error);
    return [];
  }
}

export async function SuperDealsServer() {
  const deals = await getDealsData();
  
  if (deals.length === 0) {
    return <></>;
  }
  
  return <SuperDeals deals={deals} />;
}
