// src/app/api/cms/mobile/home/route.ts
// Mobile CMS home endpoint - Serves live mobile homepage sections
// Compatible with Expo React Native HomeScreen contract
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BilingualText {
  fr: string;
  ar: string;
}

interface HeroNavigationTarget {
  type: 'category' | 'product' | 'promo';
  id?: string;
  title?: string;
}

interface PrismaMobileAppSection {
  id: string;
  sectionKey: string;
  titleFr: string;
  titleAr: string | null;
  subtitleFr: string | null;
  subtitleAr: string | null;
  order: number;
  active: boolean;
  layoutType: string;
  bannerImage: string | null;
  productIds: string[];
  categoryIds: string[];
  brandIds: string[];
  config: any;
  startAt: Date | null;
  endAt: Date | null;
  type: string;
}

interface PrismaHeroSlide {
  id: string;
  eyebrow: string | null;
  title: string;
  titleAccent: string | null;
  subtitle: string | null;
  cta: string;
  ctaSecondary: string | null;
  href: string;
  hrefSecondary: string | null;
  badge: string | null;
  stat: string | null;
  statLabel: string | null;
  image: string;
  accentColor: string | null;
  order: number;
  active: boolean;
  startDate: Date | null;
  endDate: Date | null;
}

interface PrismaBrand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

interface ExpoSection {
  id: string;
  type: string;
  active: boolean;
  order: number;
  title: BilingualText;
  subtitle?: BilingualText;
  [key: string]: any;
}

interface HeroItem {
  id: string;
  badge: BilingualText;
  title: BilingualText;
  subtitle: BilingualText;
  cta: BilingualText;
  image: string | null;
  gradient: string[];
  target: HeroNavigationTarget;
}

function parseHeroTarget(rawTarget?: any, rawLink?: string | null): HeroNavigationTarget {
  if (rawTarget && typeof rawTarget === 'object' && rawTarget.type) {
    return {
      type: rawTarget.type,
      id: rawTarget.id || undefined,
      title: rawTarget.title || undefined,
    };
  }

  if (typeof rawLink === 'string' && rawLink.trim()) {
    const link = rawLink.trim();
    if (link.includes('/categories/') || link === '/categories') {
      const parts = link.split('/categories/');
      const id = parts[1]?.split(/[?#]/)[0];
      return id ? { type: 'category', id } : { type: 'promo' };
    }
    if (link.includes('/products/')) {
      const parts = link.split('/products/');
      const id = parts[1]?.split(/[?#]/)[0];
      return id ? { type: 'product', id } : { type: 'promo' };
    }
  }

  return { type: 'promo' };
}

function normalizeGradient(gradient: any): string[] {
  if (Array.isArray(gradient) && gradient.length >= 2 && gradient.every(c => typeof c === 'string')) {
    return gradient;
  }
  if (typeof gradient === 'string' && gradient.startsWith('#')) {
    return [gradient, '#042F2E'];
  }
  return ['#0F766E', '#042F2E'];
}

function mapHeroItems(configOrSection: any, fallbackSlides: PrismaHeroSlide[]): HeroItem[] {
  const configBanners = Array.isArray(configOrSection?.banners)
    ? configOrSection.banners
    : Array.isArray(configOrSection?.config?.banners)
    ? configOrSection.config.banners
    : null;

  if (configBanners && configBanners.length > 0) {
    return configBanners.map((b: any, idx: number) => {
      const badgeFr = b.badgeFr || b.badge || '';
      const badgeAr = b.badgeAr || badgeFr;
      const titleFr = b.titleFr || b.title || '';
      const titleAr = b.titleAr || titleFr;
      const subtitleFr = b.subtitleFr || b.subtitle || '';
      const subtitleAr = b.subtitleAr || subtitleFr;
      const ctaFr = b.ctaFr || b.cta || '';
      const ctaAr = b.ctaAr || ctaFr;

      return {
        id: b.id || `banner-${idx + 1}`,
        badge: { fr: badgeFr, ar: badgeAr },
        title: { fr: titleFr, ar: titleAr },
        subtitle: { fr: subtitleFr, ar: subtitleAr },
        cta: { fr: ctaFr, ar: ctaAr },
        image: b.image || null,
        gradient: normalizeGradient(b.gradient),
        target: parseHeroTarget(b.target, b.link || b.href),
      };
    });
  }

  // Fallback to active heroSlides from DB if config.banners is empty
  if (fallbackSlides.length > 0) {
    return fallbackSlides.map((slide: PrismaHeroSlide, idx: number) => {
      const badgeText = slide.badge || slide.eyebrow || '';
      return {
        id: slide.id || `slide-${idx + 1}`,
        badge: { fr: badgeText, ar: badgeText },
        title: { fr: slide.title || '', ar: slide.title || '' },
        subtitle: { fr: slide.subtitle || '', ar: slide.subtitle || '' },
        cta: { fr: slide.cta || '', ar: slide.cta || '' },
        image: slide.image || null,
        gradient: slide.accentColor ? [slide.accentColor, '#042F2E'] : ['#0F766E', '#042F2E'],
        target: parseHeroTarget(null, slide.href),
      };
    });
  }

  return [];
}

function mapSectionToExpo(
  sec: PrismaMobileAppSection,
  heroSlides: PrismaHeroSlide[],
  brands: PrismaBrand[]
): ExpoSection {
  const sectionKey = sec.sectionKey;
  const layoutType = sec.layoutType || 'grid';
  const customType = sec.type;

  const title: BilingualText = {
    fr: sec.titleFr || sec.sectionKey,
    ar: sec.titleAr || sec.titleFr || sec.sectionKey,
  };
  const subtitle: BilingualText = {
    fr: sec.subtitleFr || '',
    ar: sec.subtitleAr || sec.subtitleFr || '',
  };

  // 1. Hero Carousel
  if (sectionKey === 'heroCarousel' || customType === 'hero' || layoutType === 'hero') {
    const items = mapHeroItems(sec.config, heroSlides);
    return {
      id: 'hero',
      type: 'hero',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      layoutType: sec.layoutType || 'carousel',
      config: sec.config || null,
      items,
    };
  }

  // 2. Categories
  if (sectionKey === 'categories' || customType === 'categories' || layoutType === 'pills') {
    return {
      id: 'categories',
      type: 'categories',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      categoryIds: sec.categoryIds || [],
      config: sec.config || null,
      layoutType: sec.layoutType || 'pills',
    };
  }

  // 3. Brands
  if (
    sectionKey === 'marquesVedettes' ||
    sectionKey === 'brands' ||
    customType === 'brands' ||
    layoutType === 'brands'
  ) {
    const brandMap = new Map(brands.map((b) => [b.id, b]));
    let selectedBrands: PrismaBrand[] = [];
    if (sec.brandIds && sec.brandIds.length > 0) {
      selectedBrands = sec.brandIds
        .map((id) => brandMap.get(id))
        .filter((b): b is PrismaBrand => Boolean(b));
    }
    const finalBrands = selectedBrands.length > 0 ? selectedBrands : brands;

    return {
      id: 'brands',
      type: 'brands',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      layoutType: sec.layoutType || 'brands',
      config: sec.config || null,
      items: finalBrands.map((b: PrismaBrand) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        logo: b.logo || null,
      })),
    };
  }

  // 4. Offers
  if (sectionKey === 'offresDuMoment' || sectionKey === 'offers') {
    return {
      id: 'offers',
      type: 'products',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      layoutType: sec.layoutType || 'carousel',
      config: sec.config || null,
      query: { promo: 1, sort: 'discount', limit: 8 },
      productIds: sec.productIds || [],
    };
  }

  // 5. Best Sellers
  if (sectionKey === 'meilleuresVentes' || sectionKey === 'bestsellers') {
    return {
      id: 'bestsellers',
      type: 'products',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      layoutType: sec.layoutType || 'grid',
      config: sec.config || null,
      query: { sort: 'bestselling', limit: 8 },
      productIds: sec.productIds || [],
    };
  }

  // 6. New Arrivals
  if (sectionKey === 'nouveautes' || sectionKey === 'newArrivals') {
    return {
      id: 'nouveautes',
      type: 'products',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      layoutType: sec.layoutType || 'grid',
      config: sec.config || null,
      query: { sort: 'newest', limit: 8 },
      productIds: sec.productIds || [],
    };
  }

  // 7. Flash Sale
  if (sectionKey === 'flash' || customType === 'flash' || sectionKey.toLowerCase() === 'flash') {
    const endsAt = sec.endAt
      ? new Date(sec.endAt).toISOString()
      : (sec.config?.endsAt || new Date(Date.now() + 3 * 3600 * 1000).toISOString());

    return {
      id: 'flash',
      type: 'flash',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      layoutType: sec.layoutType || 'banner',
      config: sec.config || null,
      endsAt,
      productIds: sec.productIds || [],
    };
  }

  // 8. Personal / Gift
  if (sectionKey === 'personal' || customType === 'personal') {
    return {
      id: 'personal',
      type: 'personal',
      active: sec.active,
      order: sec.order,
      title: { fr: '', ar: '' },
      subtitle: { fr: '', ar: '' },
    };
  }

  if (sectionKey === 'gift' || customType === 'gift') {
    return {
      id: 'gift',
      type: 'gift',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
    };
  }

  // 9. Promo Banner / Discover
  if (
    sectionKey === 'promoBanner' ||
    sectionKey === 'discover' ||
    customType === 'discover' ||
    layoutType === 'banner'
  ) {
    return {
      id: 'discover',
      type: 'discover',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      bannerImage: sec.bannerImage || null,
      config: sec.config || null,
    };
  }

  // 10. General product section
  return {
    id: sec.sectionKey,
    type: 'products',
    active: sec.active,
    order: sec.order,
    title,
    subtitle,
    layoutType: sec.layoutType || 'grid',
    query: { sort: 'popular', limit: 8 },
    productIds: sec.productIds || [],
  };
}

export async function GET() {
  try {
    const now = new Date();

    // Fetch active data in parallel
    const [mobileAppSections, heroSlides, brands] = await Promise.all([
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
      prisma.brand.findMany({
        where: { isActive: true },
        orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      }),
    ]);

    let sections: ExpoSection[] = [];

    // Only use CMS-configured sections - no fallback to hardcoded sections
    // CMS is the source of truth for all homepage sections
    if (mobileAppSections.length > 0) {
      sections = mobileAppSections.map((sec: PrismaMobileAppSection) =>
        mapSectionToExpo(sec, heroSlides, brands)
      );
    }
    // If no CMS sections configured, return empty array - app will handle gracefully

    // Sort by configured order
    sections.sort((a, b) => a.order - b.order);

    return NextResponse.json(
      {
        success: true,
        sections,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('[MOBILE CMS HOME] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mobile home data' },
      { status: 500 }
    );
  }
}

