// Theme System Types

export enum ThemeVersion {
  V1_CLASSIC = "V1_CLASSIC",
  V2_MODERN = "V2_MODERN",
  V3_PREMIUM = "V3_PREMIUM",
  V4_MINIMAL = "V4_MINIMAL",
  V5_LUXURY = "V5_LUXURY",
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  card: string;
  cardForeground: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  warning: string;
  info: string;
}

export interface Typography {
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    "4xl": string;
    "5xl": string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
}

export interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  full: string;
}

export interface Shadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
}

export interface ButtonStyles {
  primary: {
    background: string;
    foreground: string;
    hover: string;
    borderRadius: string;
    padding: string;
    fontSize: string;
    fontWeight: number;
  };
  secondary: {
    background: string;
    foreground: string;
    hover: string;
    borderRadius: string;
    padding: string;
    fontSize: string;
    fontWeight: number;
  };
  outline: {
    background: string;
    foreground: string;
    border: string;
    hover: string;
    borderRadius: string;
    padding: string;
    fontSize: string;
    fontWeight: number;
  };
  ghost: {
    background: string;
    foreground: string;
    hover: string;
    borderRadius: string;
    padding: string;
    fontSize: string;
    fontWeight: number;
  };
}

export interface HeaderConfig {
  style: "fixed" | "sticky" | "static";
  backgroundColor: string;
  textColor: string;
  logoPosition: "left" | "center";
  showSearch: boolean;
  showCart: boolean;
  showWishlist: boolean;
  showUser: boolean;
  navigationStyle: "horizontal" | "vertical" | "mega";
}

export interface FooterConfig {
  columns: number;
  backgroundColor: string;
  textColor: string;
  showNewsletter: boolean;
  showSocialLinks: boolean;
  showPaymentIcons: boolean;
  showBadges: boolean;
}

export interface LayoutSettings {
  containerWidth: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  contentPadding: string;
  sectionSpacing: string;
}

export interface Animations {
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface ComponentOverrides {
  productCard: {
    showQuickAdd: boolean;
    showWishlist: boolean;
    showRating: boolean;
    showDiscount: boolean;
    imageAspectRatio: string;
    hoverEffect: "zoom" | "slide" | "fade" | "none";
  };
  cartDrawer: {
    position: "right" | "left";
    showRelatedProducts: boolean;
    showCoupon: boolean;
  };
  checkout: {
    layout: "single" | "two-column";
    showOrderSummary: boolean;
  };
}

export interface SectionStyles {
  hero: {
    height: string;
    overlayOpacity: number;
    textAlign: "left" | "center" | "right";
  };
  productGrid: {
    columns: number;
    showFilters: boolean;
    showSort: boolean;
  };
}

export interface ThemeConfig {
  version: ThemeVersion;
  name: string;
  description?: string;
  colorPalette: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  buttons: ButtonStyles;
  header: HeaderConfig;
  footer: FooterConfig;
  layout: LayoutSettings;
  animations: Animations;
  componentOverrides: ComponentOverrides;
  sectionStyles: SectionStyles;
  customCSS?: string;
  customJS?: string;
}

export interface Theme {
  id: string;
  organizationId: string;
  version: ThemeVersion;
  name: string;
  description?: string;
  isActive: boolean;
  settings: Record<string, any>;
  colorPalette: Record<string, any>;
  typography: Record<string, any>;
  componentOverrides: Record<string, any>;
  layoutSettings: Record<string, any>;
  animations: Record<string, any>;
  headerConfig: Record<string, any>;
  footerConfig: Record<string, any>;
  sectionStyles: Record<string, any>;
  customCSS?: string;
  customJS?: string;
  previewImage?: string;
  createdAt: Date;
  updatedAt: Date;
}
