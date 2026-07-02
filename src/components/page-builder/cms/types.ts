import { LucideIcon } from 'lucide-react';

export interface Section {
  id: string;
  type: string;
  name: string;
  icon: LucideIcon;
  enabled: boolean;
  visible: boolean;
  locked: boolean;
  content?: {
    title?: string;
    subtitle?: string;
    description?: string;
    cta?: string;
    ctaLink?: string;
  };
  design?: {
    color?: string;
    radius?: string;
    shadow?: string;
    background?: string;
    backgroundType?: 'solid' | 'gradient' | 'image' | 'video';
  };
  layout?: {
    width?: string;
    height?: string;
    padding?: string;
    margin?: string;
    alignment?: 'left' | 'center' | 'right';
  };
  animation?: {
    type?: 'none' | 'fade' | 'zoom' | 'slide' | 'scale';
    duration?: number;
    delay?: number;
  };
  responsive?: {
    desktop?: boolean;
    tablet?: boolean;
    mobile?: boolean;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    openGraphImage?: string;
  };
}

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      heading: string;
      body: string;
      small: string;
    };
  };
  spacing: {
    section: string;
    element: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}
