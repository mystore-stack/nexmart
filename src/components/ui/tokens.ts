export const tokens = {
  colors: {
    primary: '#0f172a',
    primary600: '#0b1220',
    accent: '#7c3aed',
    accent200: '#a78bfa',
    surface: '#ffffff',
    muted: '#6b7280',
    success: '#10b981',
    danger: '#ef4444',
    backdrop: 'rgba(2,6,23,0.6)'
  },
  space: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    round: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(2,6,23,0.04)',
    md: '0 6px 18px rgba(2,6,23,0.08)',
    lg: '0 20px 40px rgba(2,6,23,0.12)',
  },
  fonts: {
    body: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    heading: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto',
  },
  fontSizes: {
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.5rem',
    '2xl': '2rem',
  },
  motion: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  }
};

export function applyCssVariables(target: HTMLElement = document.documentElement) {
  const set = (k: string, v: string) => target.style.setProperty(k, v);

  Object.entries(tokens.colors).forEach(([key, val]) => set(`--color-${key}`, String(val)));
  Object.entries(tokens.space).forEach(([key, val]) => set(`--space-${key}`, String(val)));
  Object.entries(tokens.radii).forEach(([key, val]) => set(`--radius-${key}`, String(val)));
  Object.entries(tokens.fontSizes).forEach(([key, val]) => set(`--font-${key}`, String(val)));
  Object.entries(tokens.motion).forEach(([key, val]) => set(`--motion-${key}`, String(val)));
}

export default tokens;
