# Mobile Hero Component Guide

## Overview

The Hero section has been completely redesigned with a **mobile-first approach** for NexStore's ecommerce marketplace. This guide covers the new architecture, implementation, and testing.

---

## 🎯 Design Principles

### Mobile-First (390px–430px)
- **Vertical stack layout**: Badge → Title → Description → CTA
- **Minimal, clean design**: Apple-style simplicity
- **High conversion focus**: CTA visible without scroll
- **Fast loading feel**: Optimized images, lazy loading
- **Touch-friendly**: Large tap targets (48px+)

### Desktop (≥768px)
- Rich carousel with multiple slides
- Product preview cards on the right
- Stats and trust badges
- Complex animations and visual storytelling
- Preserved original experience

---

## 📁 File Structure

```
src/components/home/
├── MobileHero.tsx          # Mobile component (vertical stack)
├── DesktopHero.tsx         # Desktop component (carousel + grid)
├── HeroSection.tsx         # Responsive wrapper with breakpoint logic
└── index.ts                # Barrel export
```

---

## 🧱 Component Breakdown

### MobileHero.tsx
**Purpose**: Clean, conversion-focused hero for small screens

**Props**:
```typescript
interface MobileHeroProps {
  badge?: string;                    // e.g., "🎯 Limited Time"
  title: string;                     // Main headline
  description: string;               // 1-2 lines max
  ctaLabel: string;                  // Primary button text
  ctaHref: string;                   // Primary button link
  secondaryCTALabel?: string;        // Optional secondary button
  secondaryCTAHref?: string;         // Optional secondary link
  backgroundImage?: string;          // Hero background image URL
  overlayOpacity?: number;           // Overlay darkness (0-1, default: 0.55)
}
```

**Features**:
- Staggered animations (badge → title → description → CTA)
- Subtle background pan effect (20s loop)
- 70vh minimum height (fits viewport)
- Responsive padding/spacing
- Bottom gradient fade for readability
- Active state feedback on CTAs

### DesktopHero.tsx
**Purpose**: Rich carousel experience for desktop users

**Features**:
- 3-slide carousel (auto-rotate, pauseable on hover)
- Left/right navigation controls
- Dot indicator navigation
- Product preview card (right side)
- Trust badges with icons
- Floating stat badge
- Complex Framer Motion animations

### HeroSection.tsx
**Purpose**: Responsive wrapper with breakpoint detection

**Logic**:
- Checks `window.innerWidth < 768px` on mount and resize
- Renders `<MobileHero />` on mobile
- Renders `<DesktopHero />` on desktop
- Defaults to desktop during SSR
- Re-evaluates on window resize events

---

## 🎨 Design System

### Mobile Hero Specs

| Property | Value | Notes |
|----------|-------|-------|
| Height | `min-h-[70vh]` | Fills viewport, no scroll needed |
| Padding | `px-4 py-6` | 16px sides, 24px vertical |
| Gap (spacing) | `gap-4` | 16px between elements |
| Border radius | `rounded-2xl` | 16px corners |
| Title size | `text-3xl` | 30px, bold weight |
| Title color | `text-white` | Strong contrast on dark |
| Description | `text-sm` | 14px, neutral-200 color |
| Overlay opacity | `0.55` | 55% dark overlay |
| CTA width | `w-full` | Full width, no side gaps |
| CTA padding | `py-3 px-4` | 12px vertical, 16px horizontal |
| CTA border radius | `rounded-xl` | 12px corners |
| Badge bg | `bg-white/15` | Semi-transparent white |
| Badge border | `border-white/20` | Subtle border |
| Badge animation | `animate-pulse` | Dot pulses every 2s |

### Colors

- **Background**: `bg-neutral-900` (dark backdrop)
- **Text**: `text-white` (primary), `text-neutral-200` (secondary)
- **Primary CTA**: `bg-orange-600 hover:bg-orange-700`
- **Secondary CTA**: `bg-white/10 hover:bg-white/15`
- **Badge**: `bg-white/15` with `border-white/20`
- **Overlay**: `bg-black/{opacity}` (default 55%)

### Animations (Framer Motion)

**Container animations** (staggered, 0.1s between items):
```
Badge      → 0ms   (hidden → visible)
Title      → 100ms (hidden → visible)
Description → 200ms (hidden → visible)
CTAs       → 300ms (hidden → visible)
```

**Background animation** (20s pan loop):
```
scale: 1 → 1.02 → 1 (repeat infinite, reverse)
```

**Item animation** (each element):
```
opacity: 0 → 1
y: 10px → 0
duration: 500ms
ease: easeOut
```

---

## ✅ Responsive Behavior (390px–430px)

### Viewport Rules
- **No horizontal scroll**: All content fits within `px-4` padding
- **Text readability**: Min 14px, line-height 1.5+
- **CTA visibility**: Primary button visible without scroll
- **Touch targets**: Min 48px height for buttons
- **Image aspect ratio**: Optimized for mobile

### Breakpoints
```typescript
Mobile:  < 768px  → MobileHero
Tablet:  768px–1024px → MobileHero (or could switch at 1024px)
Desktop: ≥ 1024px → DesktopHero
```

**Current threshold**: `768px` (matches Tailwind `md` breakpoint)

### Layout at 390px
```
┌─────────────────────┐
│  [Hero Section]     │
├─────────────────────┤
│  📌 Badge           │ ← 16px padding
├─────────────────────┤
│  Title              │ ← text-3xl, bold
│  (2-3 lines max)    │
├─────────────────────┤
│  Description        │ ← text-sm, neutral-200
│  (1-2 lines max)    │
├─────────────────────┤
│  [Shop Now Button]  │ ← full width, py-3
├─────────────────────┤
│  [Secondary CTA]    │ ← optional, full width
├─────────────────────┤
│  [Gradient fade]    │
└─────────────────────┘
```

---

## 🚀 Usage

### Default Usage (Responsive)
```tsx
import { HeroSection } from '@/components/home/HeroSection';

export default function HomePage() {
  return (
    <main>
      <HeroSection /> {/* Automatically responsive */}
    </main>
  );
}
```

### Custom Mobile Hero
```tsx
import { MobileHero } from '@/components/home/MobileHero';

export default function CustomPage() {
  return (
    <MobileHero
      badge="✨ New Arrival"
      title="Premium Collection"
      description="Curated products just for you"
      ctaLabel="Shop Now"
      ctaHref="/products"
      secondaryCTALabel="View Details"
      secondaryCTAHref="/about"
      backgroundImage="https://..."
      overlayOpacity={0.6}
    />
  );
}
```

### Custom Desktop Hero
```tsx
import { DesktopHero } from '@/components/home/DesktopHero';

export default function LandingPage() {
  return <DesktopHero />;
}
```

---

## 🧪 Testing Checklist

### Mobile (390px–430px)
- [ ] No horizontal scroll at any zoom level
- [ ] Text is readable (min 16px on mobile)
- [ ] Primary CTA visible without scroll
- [ ] Secondary CTA visible on scroll
- [ ] Badge animation smooth (pulse effect)
- [ ] All staggered animations play on mount
- [ ] Touch targets ≥48px (buttons especially)
- [ ] Images load without causing layout shift
- [ ] Bottom gradient fade smoothly
- [ ] Responsive to window resize

### Desktop (≥768px)
- [ ] Carousel rotates every 5.5 seconds
- [ ] Carousel pauses on hover
- [ ] Left/right navigation works
- [ ] Dot indicators work and show current slide
- [ ] Product preview card renders
- [ ] Trust badges display properly
- [ ] All animations are smooth
- [ ] No layout thrashing or jank

### Cross-Browser
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Performance
- [ ] First Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] No console errors/warnings
- [ ] Animations 60fps (Chrome DevTools)

### Accessibility
- [ ] Proper heading hierarchy (h1 for title)
- [ ] CTA buttons have descriptive labels
- [ ] Colors meet WCAG AA contrast (4.5:1 text)
- [ ] Focus indicators visible on buttons
- [ ] Screen reader announces badge/title/description
- [ ] No rapid animations (respects prefers-reduced-motion)

---

## 🔧 Customization

### Change Mobile Breakpoint
Edit `src/components/home/HeroSection.tsx`:
```typescript
// Change this line:
setIsMobile(window.innerWidth < 768); // Current: 768px

// To:
setIsMobile(window.innerWidth < 1024); // Example: 1024px
```

### Modify Animation Timing
Edit `src/components/home/MobileHero.tsx`:
```typescript
const containerVariants = {
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // ← Change delay (default 0.1)
      delayChildren: 0.3,    // ← Change start delay (default 0.2)
    },
  },
};
```

### Adjust Overlay Opacity
```tsx
<MobileHero overlayOpacity={0.7} /> {/* 70% dark */}
```

### Change Background Pan Speed
Edit `src/components/home/MobileHero.tsx`:
```typescript
const backgroundVariants = {
  animate: {
    scale: 1.02,
    transition: {
      duration: 25, // ← Change duration (default 20s)
    },
  },
};
```

---

## 🎯 Conversion Optimization

### Mobile UX Best Practices Implemented
1. **CTA above fold**: No scroll needed to see primary button
2. **Minimal text**: Badge (8 words) → Title (3-5 words) → Description (12 words)
3. **Clear hierarchy**: Large title, small description
4. **Trust signals**: Badge creates urgency (e.g., "🎯 Limited Time")
5. **Mobile-optimized touch**: 48px+ button height
6. **Fast animations**: Staggered 500ms animations (not jarring)
7. **Reduced cognitive load**: 2 CTAs max (primary + optional secondary)
8. **High contrast**: White text on dark background
9. **Loading optimization**: Eager image loading on hero

### Estimated Impact
- **Improved CTR**: Cleaner, focused design
- **Higher conversion**: CTA visible without scroll
- **Better mobile engagement**: Optimized for thumb zone
- **Reduced bounce**: Fast, premium-feeling animations

---

## 📊 Analytics Integration

Recommend tracking:
- Hero visibility (impression)
- CTA clicks (primary + secondary)
- Animation smoothness (performance)
- Mobile vs. desktop conversion rates
- Time spent on hero section

---

## 🚨 Known Limitations

1. **SSR compatibility**: Component detects mobile on client-side, defaults to desktop on SSR
2. **Resize lag**: Resize events may trigger re-renders (optimized with useEffect cleanup)
3. **Animations on low-end devices**: May reduce frame rate on older phones (consider adding `prefers-reduced-motion` support)

---

## 🔄 Future Improvements

1. Add `prefers-reduced-motion` media query support
2. Implement server-side breakpoint detection via User-Agent
3. Add analytics tracking integration
4. Create CMS admin controls for content (badge, title, description, CTA)
5. Support for admin-configured carousel slides
6. A/B testing variants (different CTAs, copy, images)
7. Dynamic content based on user segment
8. Progressive image loading (blur-up effect)

---

## 📞 Support

For questions or issues:
1. Check responsive behavior at exact breakpoints (390px, 430px, 768px, 1024px)
2. Verify Framer Motion animations in Chrome DevTools
3. Test on real mobile devices (not just browser DevTools)
4. Check console for any errors or warnings
5. Review task list completion above

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-07-26 | Initial mobile-first hero redesign |

---

**Last Updated**: July 26, 2026
**Maintained By**: NexStore Frontend Team
