/**
 * NexMart — Mobile Design Tokens
 * Modern Friendly Identity — Phase 1
 *
 * Use these tokens in all mobile-specific components.
 * Never import this in website-only components.
 */

// ─── COLOR PALETTE ────────────────────────────────────────────────────────────

export const colors = {
  // Primary brand greens
  primary: '#0B6B57',
  primaryDeep: '#084C3E',
  primaryLight: '#0A7D63',
  accent: '#19C79C',
  lemon: '#C8F169',

  // Backgrounds
  background: '#F3F5F2',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFBFA',
  surfaceDim: '#EDF0ED',

  // Text
  textPrimary: '#0C1F1B',
  textSecondary: '#3D5A54',
  textTertiary: '#7A9E97',
  textInverse: '#FFFFFF',

  // States
  success: '#19C79C',
  successBg: '#E8FDF7',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  error: '#EF4444',
  errorBg: '#FEE2E2',
  info: '#3B82F6',
  infoBg: '#EFF6FF',

  // Borders & Dividers
  border: '#D6DDD9',
  borderLight: '#E8EDEB',
  divider: '#EDF0ED',

  // Interactive
  pressed: '#084C3E',
  disabled: '#B8C8C4',
  disabledBg: '#EDF0ED',
  ripple: 'rgba(11, 107, 87, 0.12)',

  // Overlays
  overlay: 'rgba(12, 31, 27, 0.6)',
  overlayLight: 'rgba(12, 31, 27, 0.08)',

  // Status bar / splash
  statusBar: '#032c1e',

  // Loyalty tiers
  tierDebut: '#7A9E97',
  tierBronze: '#CD7F32',
  tierSilver: '#8E9EAB',
  tierGold: '#D4AF37',
} as const;

// ─── TYPOGRAPHY ───────────────────────────────────────────────────────────────

export const typography = {
  fontFamily: {
    sans: '"DM Sans", "Inter", system-ui, -apple-system, sans-serif',
    display: '"Cormorant Garamond", Georgia, serif',
    arabic: '"Cairo", "Noto Sans Arabic", system-ui, sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  fontSize: {
    xs: '11px',
    sm: '13px',
    base: '15px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px',
    display: '36px',
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: '1.2',
    snug: '1.35',
    normal: '1.5',
    relaxed: '1.65',
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.04em',
    wider: '0.08em',
  },
} as const;

// ─── SPACING ──────────────────────────────────────────────────────────────────

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',

  // Mobile-specific
  safeTop: 'env(safe-area-inset-top, 0px)',
  safeBottom: 'env(safe-area-inset-bottom, 0px)',
  safeLeft: 'env(safe-area-inset-left, 0px)',
  safeRight: 'env(safe-area-inset-right, 0px)',

  // Tap targets (minimum 48px for accessibility)
  tapMin: '48px',
  tapComfort: '56px',

  // Bottom nav
  bottomNavHeight: '64px',
  bottomNavHeightSafe: 'calc(64px + env(safe-area-inset-bottom, 0px))',
} as const;

// ─── BORDER RADIUS ────────────────────────────────────────────────────────────

export const radius = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',

  // Component-specific
  card: '16px',
  button: '12px',
  buttonPill: '9999px',
  input: '12px',
  chip: '9999px',
  productCard: '16px',
  bottomSheet: '24px',
  dialog: '20px',
  badge: '9999px',
} as const;

// ─── SHADOWS ──────────────────────────────────────────────────────────────────

export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(12, 31, 27, 0.05)',
  sm: '0 2px 8px rgba(12, 31, 27, 0.08)',
  md: '0 4px 16px rgba(12, 31, 27, 0.10)',
  lg: '0 8px 32px rgba(12, 31, 27, 0.12)',
  xl: '0 16px 48px rgba(12, 31, 27, 0.16)',

  // Specific use-cases
  card: '0 2px 12px rgba(12, 31, 27, 0.08)',
  cardHover: '0 8px 24px rgba(12, 31, 27, 0.14)',
  bottomNav: '0 -2px 16px rgba(12, 31, 27, 0.08)',
  fab: '0 4px 20px rgba(11, 107, 87, 0.30)',
  dialog: '0 20px 60px rgba(12, 31, 27, 0.20)',
  input: 'inset 0 1px 3px rgba(12, 31, 27, 0.06)',
  inputFocus: '0 0 0 3px rgba(25, 199, 156, 0.25)',
} as const;

// ─── ANIMATION ────────────────────────────────────────────────────────────────

export const animation = {
  duration: {
    instant: '80ms',
    fast: '150ms',
    normal: '220ms',
    slow: '350ms',
    slower: '500ms',
  },
  easing: {
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// ─── BREAKPOINTS ──────────────────────────────────────────────────────────────

export const breakpoints = {
  // Mobile-first
  xs: '360px',   // small phones
  sm: '390px',   // iPhone 14/15
  md: '414px',   // large phones
  lg: '768px',   // tablets
  xl: '1024px',  // desktop
} as const;

// ─── Z-INDEX ──────────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  bottomNav: 500,
  toast: 600,
  tooltip: 700,
} as const;

// ─── COMPONENT TOKENS ─────────────────────────────────────────────────────────

export const components = {
  // Product card
  productCard: {
    borderRadius: radius.productCard,
    shadow: shadows.card,
    imageAspect: '4/5',
    badgeRadius: radius.full,
  },

  // Bottom navigation
  bottomNav: {
    height: spacing.bottomNavHeight,
    heightSafe: spacing.bottomNavHeightSafe,
    background: colors.surface,
    borderTop: `1px solid ${colors.borderLight}`,
    shadow: shadows.bottomNav,
    iconSize: '24px',
    labelSize: typography.fontSize.xs,
    activeColor: colors.primary,
    inactiveColor: colors.textTertiary,
  },

  // Buttons
  button: {
    primary: {
      background: colors.primary,
      color: colors.textInverse,
      borderRadius: radius.button,
      height: spacing.tapComfort,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
      activeBackground: colors.primaryDeep,
    },
    secondary: {
      background: colors.surfaceElevated,
      color: colors.primary,
      border: `1.5px solid ${colors.border}`,
      borderRadius: radius.button,
    },
    ghost: {
      background: 'transparent',
      color: colors.primary,
    },
    accent: {
      background: colors.lemon,
      color: colors.textPrimary,
      borderRadius: radius.button,
    },
    danger: {
      background: colors.error,
      color: colors.textInverse,
    },
  },

  // Input fields
  input: {
    background: colors.surface,
    border: `1.5px solid ${colors.border}`,
    borderRadius: radius.input,
    height: spacing.tapComfort,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    placeholder: colors.textTertiary,
    focusBorder: colors.accent,
    focusShadow: shadows.inputFocus,
  },

  // Chips / Tags
  chip: {
    borderRadius: radius.chip,
    paddingX: '12px',
    paddingY: '6px',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    defaultBg: colors.surfaceDim,
    defaultColor: colors.textSecondary,
    activeBg: colors.primary,
    activeColor: colors.textInverse,
  },

  // Badges
  badge: {
    borderRadius: radius.badge,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    minWidth: '20px',
    height: '20px',
    background: colors.error,
    color: colors.textInverse,
  },

  // Bottom sheet
  bottomSheet: {
    borderRadius: `${radius.bottomSheet} ${radius.bottomSheet} 0 0`,
    background: colors.surface,
    handleColor: colors.border,
    handleWidth: '40px',
    handleHeight: '4px',
    handleRadius: radius.full,
  },

  // Search bar
  searchBar: {
    background: colors.surfaceDim,
    borderRadius: radius.full,
    height: '44px',
    iconColor: colors.textTertiary,
    fontSize: typography.fontSize.base,
  },

  // Promotional banner
  banner: {
    borderRadius: radius.xl,
    aspectRatio: '21/9',
    indicatorActive: colors.surface,
    indicatorInactive: 'rgba(255,255,255,0.4)',
  },
} as const;

// ─── LOYALTY TIER CONFIG ───────────────────────────────────────────────────────

export const loyaltyTiers = [
  {
    id: 1,
    key: 'debut',
    label: 'Débutant',
    labelAr: 'مبتدئ',
    min: 0,
    color: colors.tierDebut,
    icon: '⭐',
    benefits: [],
  },
  {
    id: 2,
    key: 'bronze',
    label: 'Bronze',
    labelAr: 'برونز',
    min: 100,
    color: colors.tierBronze,
    icon: '🥉',
    benefits: ['5% de réduction'],
  },
  {
    id: 3,
    key: 'silver',
    label: 'Silver',
    labelAr: 'فضي',
    min: 500,
    color: colors.tierSilver,
    icon: '🥈',
    benefits: ['10% de réduction', 'Livraison gratuite'],
  },
  {
    id: 4,
    key: 'gold',
    label: 'Gold',
    labelAr: 'ذهبي',
    min: 1000,
    color: colors.tierGold,
    icon: '🥇',
    benefits: ['15% de réduction', 'Livraison gratuite', 'Support prioritaire'],
  },
] as const;

// ─── BOTTOM NAV ITEMS ─────────────────────────────────────────────────────────

export const bottomNavItems = [
  { key: 'home',       labelFr: 'Accueil',     labelAr: 'الرئيسية', href: '/',          icon: 'Home' },
  { key: 'categories', labelFr: 'Catégories',  labelAr: 'الفئات',   href: '/categories', icon: 'Grid3x3' },
  { key: 'discover',   labelFr: 'Découvrir',   labelAr: 'اكتشف',    href: '/explore',    icon: 'Sparkles' },
  { key: 'cart',       labelFr: 'Panier',      labelAr: 'السلة',    href: '/cart',       icon: 'ShoppingCart' },
  { key: 'account',    labelFr: 'Compte',      labelAr: 'حسابي',    href: '/account',    icon: 'User' },
] as const;

// ─── TYPE EXPORTS ─────────────────────────────────────────────────────────────

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;

// Default export for convenience
const tokens = { colors, typography, spacing, radius, shadows, animation, breakpoints, zIndex, components, loyaltyTiers, bottomNavItems };
export default tokens;
