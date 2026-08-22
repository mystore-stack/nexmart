// src/config/theme.ts
export const THEME_CONFIG = {
  colors: {
    // Primary
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      500: '#d4af37', // Gold/Brand
      600: '#c9a227',
      700: '#b8921b',
      900: '#5a4a0a',
    },
    // Neutral
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      950: '#0a0a0a',
    },
    // Semantic
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  gradients: {
    // Premium gradients
    heroGradient:
      'linear-gradient(135deg, #d4af37 0%, #f0e68c 50%, #daa520 100%)',
    darkGradient:
      'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
    glassGradient:
      'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    purpleGradient:
      'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
    oceanGradient:
      'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)',
    fireGradient:
      'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #d946ef 100%)',
    emeraldGradient:
      'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
    xl: '0 16px 24px rgba(0, 0, 0, 0.1)',
    '2xl': '0 20px 25px rgba(0, 0, 0, 0.1)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
    neon: '0 0 20px rgba(212, 175, 55, 0.3)',
  },
  blur: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
  },
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
};

export type ThemeConfig = typeof THEME_CONFIG;
