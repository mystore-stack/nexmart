// Mobile Hero Carousel Configuration Schema
// Professional CMS-controlled hero carousel with comprehensive controls
// Backward compatible with existing HeroStudio data

export interface MobileHeroBannerItem {
  // Core identity
  id: string;

  // Mode: image-only (text embedded in image) or editable-overlay (CMS text over image)
  mode?: 'image-only' | 'editable-overlay';

  // --- IMAGE CONTROLS ---
  image?: string;
  imageFocalPoint?: { x: number; y: number }; // 0-100 range
  imageZoom?: number; // 0.5 to 3.0
  imageRotation?: number; // -10 to 10 degrees
  imagePosition?: { x: number; y: number }; // 0-100 range
  imageFit?: 'cover' | 'contain' | 'fill' | 'natural';

  // --- TYPOGRAPHY CONTROLS ---
  // Badge
  badgeFr?: string;
  badgeAr?: string;
  badgeVisible?: boolean;
  badgeFontSize?: number; // 10-24px
  badgeColor?: string;
  badgeBackgroundColor?: string;
  badgePosition?: { x: number; y: number }; // 0-100 range
  badgeAlignment?: 'left' | 'center' | 'right';

  // Title
  titleFr: string;
  titleAr?: string;
  titleVisible?: boolean;
  titleFontSize?: number; // 16-48px
  titleFontWeight?: '400' | '500' | '600' | '700' | '800' | '900';
  titleColor?: string;
  titlePosition?: { x: number; y: number }; // 0-100 range
  titleAlignment?: 'left' | 'center' | 'right';
  titleMaxWidth?: number; // pixels
  titleLineHeight?: number; // 1.0-2.0

  // Subtitle
  subtitleFr?: string;
  subtitleAr?: string;
  subtitleVisible?: boolean;
  subtitleFontSize?: number; // 12-24px
  subtitleFontWeight?: '400' | '500' | '600' | '700';
  subtitleColor?: string;
  subtitlePosition?: { x: number; y: number }; // 0-100 range
  subtitleAlignment?: 'left' | 'center' | 'right';
  subtitleMaxWidth?: number; // pixels
  subtitleLineHeight?: number; // 1.0-2.0

  // --- CTA CONTROLS ---
  ctaVisible?: boolean;
  ctaFr?: string;
  ctaAr?: string;
  ctaBackgroundColor?: string;
  ctaTextColor?: string;
  ctaBorderRadius?: number; // 4-24px
  ctaWidth?: number; // pixels
  ctaHeight?: number; // pixels
  ctaPosition?: { x: number; y: number }; // 0-100 range
  ctaAlignment?: 'left' | 'center' | 'right';

  // Secondary CTA (optional)
  ctaSecondaryVisible?: boolean;
  ctaSecondaryFr?: string;
  ctaSecondaryAr?: string;
  ctaSecondaryBackgroundColor?: string;
  ctaSecondaryTextColor?: string;
  ctaSecondaryBorderRadius?: number;
  ctaSecondaryDestination?: HeroNavigationTarget;

  // --- VISUAL EFFECTS ---
  gradient?: string[];
  gradientAngle?: number; // 0-360 degrees
  overlayOpacity?: number; // 0-1 range
  overlayColor?: string;
  overlayEnabled?: boolean;

  // --- NAVIGATION ---
  target?: HeroNavigationTarget;
  link?: string; // Legacy field for backward compatibility

  // --- LEGACY FIELDS (for backward compatibility) ---
  eyebrow?: string; // Legacy badge field
  titleAccent?: string; // Legacy title color
  accentColor?: string; // Legacy gradient
  stat?: string;
  statLabel?: string;
  href?: string;
  hrefSecondary?: string;
}

export interface HeroNavigationTarget {
  type: 'promo' | 'category' | 'product';
  id?: string;
  title?: string;
}

// Default values for new slides
export const DEFAULT_HERO_BANNER: Omit<MobileHeroBannerItem, 'id' | 'titleFr'> = {
  mode: 'editable-overlay',
  image: undefined,
  imageFocalPoint: { x: 50, y: 50 },
  imageZoom: 1,
  imageRotation: 0,
  imagePosition: { x: 50, y: 50 },
  imageFit: 'cover',

  badgeFr: 'Offre Spéciale',
  badgeAr: 'عرض خاص',
  badgeVisible: true,
  badgeFontSize: 11,
  badgeColor: '#FFFFFF',
  badgeBackgroundColor: 'rgba(9, 60, 50, 0.78)',
  badgePosition: { x: 10, y: 10 },
  badgeAlignment: 'left',

  titleFr: 'Nouvelle Bannière',
  titleAr: 'عنوان جديد',
  titleVisible: true,
  titleFontSize: 32,
  titleFontWeight: '900',
  titleColor: '#FFFFFF',
  titlePosition: { x: 10, y: 45 },
  titleAlignment: 'left',
  titleMaxWidth: 300,
  titleLineHeight: 1.1,

  subtitleFr: 'Découvrez notre sélection exclusive',
  subtitleAr: 'اكتشف تشكيلتنا الحصرية',
  subtitleVisible: true,
  subtitleFontSize: 13,
  subtitleFontWeight: '400',
  subtitleColor: 'rgba(255, 255, 255, 0.92)',
  subtitlePosition: { x: 10, y: 60 },
  subtitleAlignment: 'left',
  subtitleMaxWidth: 300,
  subtitleLineHeight: 1.4,

  ctaVisible: true,
  ctaFr: 'Découvrir',
  ctaAr: 'اكتشف الآن',
  ctaBackgroundColor: '#FFFFFF',
  ctaTextColor: '#0D5043',
  ctaBorderRadius: 20,
  ctaWidth: 120,
  ctaHeight: 38,
  ctaPosition: { x: 10, y: 75 },
  ctaAlignment: 'left',

  ctaSecondaryVisible: false,

  gradient: ['#0F766E', '#042F2E'],
  gradientAngle: 135,
  overlayOpacity: 0.65,
  overlayColor: '#042F2E',
  overlayEnabled: true,

  target: { type: 'promo' },
};

// Helper to merge with legacy data
export function normalizeHeroBanner(item: any): MobileHeroBannerItem {
  const defaults = { ...DEFAULT_HERO_BANNER, id: item.id || `banner-${Date.now()}` };

  // If mode is explicitly image-only, hide all text
  if (item.mode === 'image-only') {
    return {
      ...defaults,
      ...item,
      badgeVisible: false,
      titleVisible: false,
      subtitleVisible: false,
      ctaVisible: false,
      ctaSecondaryVisible: false,
    };
  }

  // Merge with defaults, preserving existing values
  return {
    ...defaults,
    ...item,
    // Map legacy fields to new fields for backward compatibility
    badgeFr: item.badgeFr || item.badge || item.eyebrow || defaults.badgeFr,
    badgeAr: item.badgeAr || item.badge || item.eyebrow || defaults.badgeAr,
    titleColor: item.titleColor || item.titleAccent || item.accentColor || defaults.titleColor,
    accentColor: item.accentColor || item.gradient?.[0],
  };
}
