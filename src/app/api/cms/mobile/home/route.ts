// src/app/api/cms/mobile/home/route.ts
// Mobile CMS home endpoint - Serves live mobile homepage sections
// Compatible with Expo React Native HomeScreen contract
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeHeroBanner } from '@/lib/cms/schemas/mobile-hero';
import { projectMobileProductShelf } from '@/lib/cms/mobile-product-shelf';
import { resolveMobileSectionType } from '@/lib/cms/mobile-section-types';
import { mobileSectionConfigSchema, validateMobilePopupConfig } from '@/lib/cms/schemas/mobile-app-section';

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
  updatedAt: Date;
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
  ctaSecondary?: BilingualText;
  image: string | null;
  target: HeroNavigationTarget;
  // Advanced controls (new)
  mode?: 'image-only' | 'editable-overlay';
  imageZoom?: number;
  imageRotation?: number;
  imagePosition?: { x: number; y: number };
  imageFit?: 'cover' | 'contain' | 'fill' | 'natural';
  imageFocalPoint?: { x: number; y: number };
  badgeVisible?: boolean;
  badgeFontSize?: number;
  badgeColor?: string;
  badgeBackgroundColor?: string;
  badgePosition?: { x: number; y: number };
  badgeAlignment?: 'left' | 'center' | 'right';
  titleVisible?: boolean;
  titleFontSize?: number;
  titleFontWeight?: string;
  titleColor?: string;
  titlePosition?: { x: number; y: number };
  titleAlignment?: 'left' | 'center' | 'right';
  titleMaxWidth?: number;
  titleLineHeight?: number;
  subtitleVisible?: boolean;
  subtitleFontSize?: number;
  subtitleFontWeight?: string;
  subtitleColor?: string;
  subtitlePosition?: { x: number; y: number };
  subtitleAlignment?: 'left' | 'center' | 'right';
  subtitleMaxWidth?: number;
  subtitleLineHeight?: number;
  ctaVisible?: boolean;
  ctaBackgroundColor?: string;
  ctaTextColor?: string;
  ctaBorderRadius?: number;
  ctaWidth?: number;
  ctaHeight?: number;
  ctaPosition?: { x: number; y: number };
  ctaAlignment?: 'left' | 'center' | 'right';
  ctaSecondaryVisible?: boolean;
  ctaSecondaryBackgroundColor?: string;
  ctaSecondaryTextColor?: string;
  ctaSecondaryBorderRadius?: number;
  ctaSecondaryWidth?: number;
  ctaSecondaryHeight?: number;
  overlayEnabled?: boolean;
  overlayOpacity?: number;
  overlayColor?: string;
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

function mapHeroItems(configOrSection: any, fallbackSlides: PrismaHeroSlide[]): HeroItem[] {
  const configBanners = Array.isArray(configOrSection?.banners)
    ? configOrSection.banners
    : Array.isArray(configOrSection?.config?.banners)
      ? configOrSection.config.banners
      : null;

  if (configBanners && configBanners.length > 0) {
    return configBanners.map((b: any, idx: number) => {
      // Normalize banner to handle new schema and legacy data
      const normalized = normalizeHeroBanner(b);

      const badgeFr = normalized.badgeFr || '';
      const badgeAr = normalized.badgeAr || badgeFr;
      const titleFr = normalized.titleFr || '';
      const titleAr = normalized.titleAr || titleFr;
      const subtitleFr = normalized.subtitleFr || '';
      const subtitleAr = normalized.subtitleAr || subtitleFr;
      const ctaFr = normalized.ctaFr || '';
      const ctaAr = normalized.ctaAr || ctaFr;
      const ctaSecondaryFr = normalized.ctaSecondaryFr || '';
      const ctaSecondaryAr = normalized.ctaSecondaryAr || ctaSecondaryFr;

      return {
        id: normalized.id || `banner-${idx + 1}`,
        badge: { fr: badgeFr, ar: badgeAr },
        title: { fr: titleFr, ar: titleAr },
        subtitle: { fr: subtitleFr, ar: subtitleAr },
        cta: { fr: ctaFr, ar: ctaAr },
        ctaSecondary: { fr: ctaSecondaryFr, ar: ctaSecondaryAr },
        image: normalized.image || null,
        target: parseHeroTarget(normalized.target, normalized.link || normalized.href),
        // Pass through new controls for mobile app to use
        mode: normalized.mode,
        imageZoom: normalized.imageZoom,
        imageRotation: normalized.imageRotation,
        imagePosition: normalized.imagePosition,
        imageFit: normalized.imageFit,
        imageFocalPoint: normalized.imageFocalPoint,
        badgeVisible: normalized.badgeVisible,
        badgeFontSize: normalized.badgeFontSize,
        badgeColor: normalized.badgeColor,
        badgeBackgroundColor: normalized.badgeBackgroundColor,
        badgePosition: normalized.badgePosition,
        badgeAlignment: normalized.badgeAlignment,
        titleVisible: normalized.titleVisible,
        titleFontSize: normalized.titleFontSize,
        titleFontWeight: normalized.titleFontWeight,
        titleColor: normalized.titleColor,
        titlePosition: normalized.titlePosition,
        titleAlignment: normalized.titleAlignment,
        titleMaxWidth: normalized.titleMaxWidth,
        titleLineHeight: normalized.titleLineHeight,
        subtitleVisible: normalized.subtitleVisible,
        subtitleFontSize: normalized.subtitleFontSize,
        subtitleFontWeight: normalized.subtitleFontWeight,
        subtitleColor: normalized.subtitleColor,
        subtitlePosition: normalized.subtitlePosition,
        subtitleAlignment: normalized.subtitleAlignment,
        subtitleMaxWidth: normalized.subtitleMaxWidth,
        subtitleLineHeight: normalized.subtitleLineHeight,
        ctaVisible: normalized.ctaVisible,
        ctaBackgroundColor: normalized.ctaBackgroundColor,
        ctaTextColor: normalized.ctaTextColor,
        ctaBorderRadius: normalized.ctaBorderRadius,
        ctaWidth: normalized.ctaWidth,
        ctaHeight: normalized.ctaHeight,
        ctaPosition: normalized.ctaPosition,
        ctaAlignment: normalized.ctaAlignment,
        ctaSecondaryVisible: normalized.ctaSecondaryVisible,
        ctaSecondaryBackgroundColor: normalized.ctaSecondaryBackgroundColor,
        ctaSecondaryTextColor: normalized.ctaSecondaryTextColor,
        ctaSecondaryBorderRadius: normalized.ctaSecondaryBorderRadius,
        ctaSecondaryWidth: normalized.ctaSecondaryWidth,
        ctaSecondaryHeight: normalized.ctaSecondaryHeight,
        overlayEnabled: normalized.overlayEnabled,
        overlayOpacity: normalized.overlayOpacity,
        overlayColor: normalized.overlayColor,
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
        target: parseHeroTarget(null, slide.href),
      };
    });
  }

  return [];
}

export function mapSectionToExpo(
  sec: PrismaMobileAppSection,
  heroSlides: PrismaHeroSlide[],
  brands: PrismaBrand[]
): ExpoSection | null {
  const sectionKey = sec.sectionKey;
  const layoutType = sec.layoutType || 'grid';
  const customType = sec.type;
  const sectionType = resolveMobileSectionType(sectionKey, customType);
  if (!sectionType) return null;
  const parsedConfig = mobileSectionConfigSchema.safeParse(sec.config);
  const config = (parsedConfig.success ? parsedConfig.data || null : null) as Record<string, any> | null;

  const title: BilingualText = {
    fr: sec.titleFr || sec.sectionKey,
    ar: sec.titleAr || sec.titleFr || sec.sectionKey,
  };
  const subtitle: BilingualText = {
    fr: sec.subtitleFr || '',
    ar: sec.subtitleAr || sec.subtitleFr || '',
  };

  // 1. Hero Carousel
  if (sectionType === 'hero') {
    const items = mapHeroItems(config, heroSlides);
    return {
      id: 'hero',
      type: 'hero',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      layoutType: sec.layoutType || 'carousel',
      config,
      items,
    };
  }

  // 2. Categories
  if (sectionType === 'categories') {
    return {
      id: 'categories',
      type: 'categories',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      categoryIds: sec.categoryIds || [],
      config,
      layoutType: sec.layoutType || 'pills',
    };
  }

  // 3. Brands
  if (sectionType === 'brands') {
    const brandMap = new Map(brands.map((b) => [b.id, b]));
    let selectedBrands: PrismaBrand[] = [];
    if (sec.brandIds && sec.brandIds.length > 0) {
      selectedBrands = sec.brandIds
        .map((id) => brandMap.get(id))
        .filter((b): b is PrismaBrand => Boolean(b));
    }
    const manualBrandSelection = config?.brandSelectionMode === 'manual';
    const finalBrands = manualBrandSelection
      ? selectedBrands
      : selectedBrands.length > 0
        ? selectedBrands
        : brands;
    const maxVisible = Math.max(1, Math.floor(Number(config?.maxVisible) || 10));

    return {
      id: 'brands',
      type: 'brands',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      layoutType: sec.layoutType || 'brands',
      config,
      items: finalBrands.slice(0, maxVisible).map((b: PrismaBrand) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        logo: config?.brandLogos?.[b.id] || b.logo || null,
      })),
    };
  }

  // 4. Offers (Offres du Moment - Image-Only Advertising)
  if (sectionType === 'offers') {
    const advertisements = Array.isArray(config?.advertisements)
      ? config.advertisements
        .filter((ad: any) => ad && typeof ad === 'object' && typeof ad.imageUrl === 'string' && ad.imageUrl.trim() && ad.active !== false)
        .map((ad: any) => ({
          id: ad.id,
          imageUrl: ad.imageUrl,
          title: ad.title || '',
          destinationUrl: ad.destinationUrl || null,
          openExternally: ad.openExternally || false,
        }))
      : [];

    return {
      id: 'offers',
      type: 'offers',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      layoutType: sec.layoutType || 'carousel',
      config,
      advertisements,
    };
  }

  // 5. Best Sellers
  const normalizedKey = sectionKey.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (sectionType === 'products' && ['meilleuresventes', 'bestsellers'].includes(normalizedKey)) {
    const shelf = projectMobileProductShelf('bestselling', config, sec.productIds);
    return {
      id: 'bestsellers',
      type: 'products',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      layoutType: sec.layoutType || 'grid',
      config,
      query: shelf.query,
      productIds: shelf.productIds,
    };
  }

  // 6. New Arrivals
  if (sectionType === 'products' && ['nouveautes', 'newarrivals'].includes(normalizedKey)) {
    const shelf = projectMobileProductShelf('newest', config, sec.productIds);
    return {
      id: 'nouveautes',
      type: 'products',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      layoutType: sec.layoutType || 'grid',
      config,
      query: shelf.query,
      productIds: shelf.productIds,
    };
  }

  // 7. Flash Sale
  if (sectionType === 'flash') {
    const endsAt = sec.endAt
      ? new Date(sec.endAt).toISOString()
      : (config?.endsAt || null);

    return {
      id: 'flash',
      type: 'flash',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      layoutType: sec.layoutType || 'banner',
      config,
      endsAt,
      productIds: sec.productIds || [],
    };
  }

  // 8. Personal / Gift
  if (sectionType === 'personal') {
    return {
      id: 'personal',
      type: 'personal',
      active: sec.active,
      order: sec.order,
      title: { fr: '', ar: '' },
      subtitle: { fr: '', ar: '' },
    };
  }

  if (sectionType === 'gift') {
    return {
      id: 'gift',
      type: 'gift',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      config,
    };
  }

  // 9. Promo Banner / Discover
  if (sectionType === 'discover') {
    const resolvedBanner = sec.bannerImage || config?.image || config?.canvaComposition?.backgroundImage || null;
    return {
      id: 'discover',
      type: 'discover',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      bannerImage: resolvedBanner,
      config,
    };
  }

  // 9b. Custom Banner
  if (sectionType === 'custom-banner') {
    const resolvedBanner = sec.bannerImage || config?.image || config?.bannerImage || null;
    return {
      id: sec.id || sec.sectionKey,
      type: 'custom-banner',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      layoutType: sec.layoutType || 'banner',
      bannerImage: resolvedBanner,
      config,
      ctaLabel: config?.ctaLabel || 'Découvrir',
      ctaAction: config?.ctaAction || 'SHOP',
      backgroundColor: config?.backgroundColor || '#1B4332',
      textColor: config?.textColor || '#FFFFFF',
      accentColor: config?.accentColor || '#D4AF37',
      icon: config?.icon || 'sparkles',
    };
  }

  // 10. NexPlay (Loyalty & Gamification)
  if (sectionType === 'nexplay') {
    return {
      id: 'nexplay',
      type: 'nexplay',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      config,
    };
  }

  if (sectionType === 'announcement-popup') {
    const validation = validateMobilePopupConfig(config, customType, sectionKey);
    return {
      id: sec.id,
      type: 'announcement-popup',
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      startAt: sec.startAt?.toISOString() || null,
      endAt: sec.endAt?.toISOString() || null,
      config: validation.success ? config : null,
    };
  }

  if (['welcome-offer', 'gift-quest', 'smart-journey', 'grouped-offers', 'coupons'].includes(sectionType)) {
    const validation = ['welcome-offer', 'gift-quest'].includes(sectionType)
      ? validateMobilePopupConfig(config, customType, sectionKey)
      : { success: true };
    return {
      id: sec.id,
      type: sectionType,
      active: sec.active,
      order: sec.order,
      title,
      subtitle,
      config: validation.success ? config : null,
      productIds: sec.productIds || [],
    };
  }

  if (sectionType !== 'products') return null;
  const shelf = projectMobileProductShelf('popular', config, sec.productIds);
  return {
    id: sec.sectionKey,
    type: 'products',
    active: sec.active,
    order: sec.order,
    title,
    subtitle,
    layoutType: sec.layoutType || 'grid',
    config,
    query: shelf.query,
    productIds: shelf.productIds,
  };
}

export async function GET() {
  try {
    const now = new Date();

    // Fetch active data in parallel
    const [mobileAppSections, heroSlides, brands, globalSettingsRecord] = await Promise.all([
      prisma.mobileAppSection.findMany({
        where: {
          sectionKey: { not: 'global_settings' },
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
      prisma.mobileAppSection.findUnique({
        where: { sectionKey: 'global_settings' },
      }),
    ]);

    let sections: ExpoSection[] = [];

    // Only use CMS-configured sections - no fallback to hardcoded sections
    // CMS is the source of truth for all homepage sections
    if (mobileAppSections.length > 0) {
      sections = mobileAppSections
        .map((sec: PrismaMobileAppSection) => mapSectionToExpo(sec, heroSlides, brands))
        .filter((section): section is ExpoSection => section !== null);
    }

    // Sort by configured order
    sections.sort((a, b) => a.order - b.order);

    // Get latest timestamp for version tracking
    const lastUpdated = mobileAppSections.length > 0
      ? new Date(Math.max(...mobileAppSections.map((s) => s.updatedAt.getTime()))).toISOString()
      : new Date().toISOString();

    const settings = globalSettingsRecord?.config || null;

    return NextResponse.json(
      {
        success: true,
        sections,
        settings,
        version: lastUpdated,
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

