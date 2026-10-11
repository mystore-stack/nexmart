// src/app/api/cms/mobile/home/route.ts
// Mobile CMS home endpoint - REUSES EXISTING DATA
// Uses MobileAppBanner, MobileAppSection, HeroSlide, HomePromoCard tables
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const now = new Date();

    // Fetch data from existing tables
    const [
      heroSlides,
      mobileAppBanner,
      mobileAppSections,
      homePromoCards,
      brands,
    ] = await Promise.all([
      // Hero slides
      prisma.heroSlide.findMany({
        where: {
          active: true,
          AND: [
            { OR: [{ startDate: null }, { startDate: { lte: now } }] },
            { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          ],
        },
        orderBy: { order: 'asc' },
      }),
      // Mobile app banner
      prisma.mobileAppBanner.findFirst({
        where: { active: true },
      }),
      // Mobile app sections
      prisma.mobileAppSection.findMany({
        where: {
          active: true,
          AND: [
            { OR: [{ startAt: null }, { startAt: { lte: now } }] },
            { OR: [{ endAt: null }, { endAt: { gte: now } }] },
          ],
        },
        orderBy: { order: 'asc' },
      }),
      // Home promo cards
      prisma.homePromoCard.findMany({
        where: {
          active: true,
          AND: [
            { OR: [{ startDate: null }, { startDate: { lte: now } }] },
            { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          ],
        },
        orderBy: { order: 'asc' },
      }),
      // Brands for carousel
      prisma.brand.findMany({
        where: {
          isActive: true,
          isFeatured: true,
        },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      }),
    ]);

    // Convert to mobile sections format
    const sections = [];

    // Hero section from HeroSlide
    if (heroSlides.length > 0) {
      sections.push({
        id: 'hero',
        type: 'hero',
        active: true,
        order: 1,
        title: { fr: 'Promotions', ar: 'عروض' },
        items: heroSlides.map((slide: any) => ({
          badge: slide.badge || '',
          title: slide.title || '',
          subtitle: slide.subtitle || '',
          cta: slide.cta || '',
          image: slide.image || '',
          gradient: slide.accentColor || '',
          target: { type: 'link', id: slide.href || '' },
        })),
      });
    }

    // Brands carousel section
    if (brands.length > 0) {
      sections.push({
        id: 'brands',
        type: 'brands',
        active: true,
        order: 2,
        title: { fr: 'Marques', ar: 'العلامات التجارية' },
        items: brands.map((brand: any) => ({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          logo: brand.logo,
        })),
      });
    }

    // Mobile app banner section
    if (mobileAppBanner) {
      sections.push({
        id: 'app-banner',
        type: 'banner',
        active: true,
        order: 3,
        title: { fr: 'Application Mobile', ar: 'تطبيق الجوال' },
        items: [{
          title: mobileAppBanner.title || '',
          subtitle: mobileAppBanner.subtitle || '',
          image: mobileAppBanner.qrCodeImage || '',
          appStoreUrl: mobileAppBanner.appStoreUrl || '',
          googlePlayUrl: mobileAppBanner.googlePlayUrl || '',
        }],
      });
    }

    // Categories from MobileAppSection
    const categorySections = mobileAppSections
      .filter((section: any) => section.categoryIds && section.categoryIds.length > 0)
      .map((section: any) => ({
        id: section.sectionKey,
        type: 'categories',
        active: section.active,
        order: section.order + 10, // Offset to account for hero/brands/banner
        title: {
          fr: section.titleFr || section.sectionKey,
          ar: section.titleAr || section.sectionKey,
        },
        categoryIds: section.categoryIds,
      }));

    if (categorySections.length > 0) {
      sections.push(...categorySections);
    }

    // Products from MobileAppSection
    const productSections = mobileAppSections
      .filter((section: any) => section.productIds && section.productIds.length > 0)
      .map((section: any) => ({
        id: section.sectionKey,
        type: 'products',
        active: section.active,
        order: section.order + 10, // Offset to account for hero/brands/banner
        title: {
          fr: section.titleFr || section.sectionKey,
          ar: section.titleAr || section.sectionKey,
        },
        productIds: section.productIds,
        layoutType: section.layoutType || 'grid',
      }));

    if (productSections.length > 0) {
      sections.push(...productSections);
    }

    // Promo cards section
    if (homePromoCards.length > 0) {
      sections.push({
        id: 'promos',
        type: 'cards',
        active: true,
        order: 99,
        title: { fr: 'Offres', ar: 'عروض' },
        items: homePromoCards.map((card: any) => ({
          id: card.id,
          title: card.title || '',
          subtitle: card.subtitle || '',
          image: card.image || '',
          link: card.link || '',
          ctaText: card.ctaText || '',
          badgeText: card.badgeText || '',
        })),
      });
    }

    return NextResponse.json({
      success: true,
      sections,
    });
  } catch (error) {
    console.error('[MOBILE CMS HOME] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mobile home data' },
      { status: 500 }
    );
  }
}
