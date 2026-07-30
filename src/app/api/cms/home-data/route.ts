// src/app/api/cms/home-data/route.ts — Dynamic Homepage Data API Endpoint
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const [
      banners,
      promos,
      flashDeals,
      serviceBanners,
      sponsored,
      bestsellers,
      newArrivals,
      mysteryBoxes,
      bundleConfig,
      brands,
      features,
      newsletter,
      footer,
    ] = await Promise.all([
      // Banners
      prisma.homeBanner.findMany({
        where: {
          active: true,
          OR: [{ startDate: null }, { startDate: { lte: now } }],
          AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
        },
        orderBy: { order: "asc" },
      }),
      // Promos
      prisma.homePromoCard.findMany({
        where: {
          active: true,
          OR: [{ startDate: null }, { startDate: { lte: now } }],
          AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
        },
        orderBy: { order: "asc" },
      }),
      // Flash Deals
      prisma.flashDealItem.findMany({
        where: {
          active: true,
          OR: [{ startDate: null }, { startDate: { lte: now } }],
          AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
        },
        orderBy: { order: "asc" },
      }),
      // Service Banners
      prisma.homeServiceBanner.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
      // Sponsored
      prisma.sponsoredProduct.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
      // Bestsellers
      prisma.bestsellerConfig.findMany({
        where: { active: true },
        orderBy: { rank: "asc" },
      }),
      // New Arrivals
      prisma.newArrivalConfig.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
      // Mystery Boxes
      prisma.mysteryBoxConfig.findMany({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      }),
      // Bundle Config
      prisma.bundleConfig.findFirst({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      }),
      // Brands
      prisma.brandPartner.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
      // Features
      prisma.homeFeature.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
      // Newsletter
      prisma.newsletterConfig.findFirst({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      }),
      // Footer
      prisma.footerConfig.findFirst({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        banners,
        promos,
        flashDeals,
        serviceBanners,
        sponsored,
        bestsellers,
        newArrivals,
        mysteryBoxes,
        bundleConfig,
        brands,
        features,
        newsletter,
        footer,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch homepage dynamic data" },
      { status: 500 }
    );
  }
}
