import { NextResponse } from "next/server";
import { getHomePageData } from "@/lib/home-data";

export async function GET() {
  try {
    const homepage = await getHomePageData();
    const sections = homepage.cms.homeSections || [];

    return NextResponse.json({
      success: true,
      data: sections,
      categories: homepage.categories,
      brands: homepage.cms.brandPartners,
      sponsored: homepage.cms.sponsored,
      momentOffers: homepage.cms.momentOffers,
    });
  } catch (error) {
    console.error("Error fetching homepage sections:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch homepage sections",
      },
      { status: 500 }
    );
  }
}
