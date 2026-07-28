# Phase 1: Home Page Redesign - Detailed Implementation Guide

**Duration**: 4-5 days  
**Components**: 9 major sections + redesigned layout  
**Status**: Ready to begin

---

## 🎯 Objectives

Transform the home page from a simple marketplace layout into a **premium, high-conversion marketplace** experience that guides users through all key product categories, deals, and special offerings.

**Current Layout**:
```
- Top banner (notifications)
- Navbar
- Hero section (split layout)
- Departments sidebar + carousel
- Categories grid
- Flash deals
- Bundle deals
- Featured products
- Trending products
- Promo banners
- Newsletter
- Footer
```

**Target Layout**:
```
- Top banner (optimized)
- Navbar (enhanced)
- Hero section (premium split/carousel)
- Categories grid (optimized: 2-4-6 cols)
- Flash deals (horizontal scroll, refined)
- Featured collections carousel
- Bundle deals section (enhanced cards)
- Featured products grid (2-4 cols)
- Mystery box showcase (premium)
- Trust section (badges + stats)
- Related products carousel
- Seasonal/campaign section (optional)
- Newsletter signup (refined)
- Footer (enhanced)
```

---

## 📐 Layout Structure (By Device)

### Mobile (< 640px)

```
┌─────────────────────────────────┐
│  Top banner (Zap icon)          │ ← 32px height
├─────────────────────────────────┤
│  Navbar (compact)               │ ← 60px height
├─────────────────────────────────┤
│  Hero (full width)              │ ← 60vh min
│  [Image + vertical text stack]  │
│  [CTA buttons stacked]          │
├─────────────────────────────────┤
│  Categories (2 columns)         │ ← gap 8px, padding 16px
│  [Icon + Label]  [Icon + Label] │
│  [Icon + Label]  [Icon + Label] │
│  [Icon + Label]  [Icon + Label] │
│  ...                            │
├─────────────────────────────────┤
│  Flash Deals (scroll →)         │
│  [Card] [Card] [Card] ...       │
├─────────────────────────────────┤
│  Collections                    │
│  [Large image] [Large image]    │
├─────────────────────────────────┤
│  Bundle Deals (scroll →)        │
│  [Card] [Card] [Card] ...       │
├─────────────────────────────────┤
│  Featured Products (2 cols)     │
│  [Card] [Card]                  │
│  [Card] [Card]                  │
│  [Card] [Card]                  │
│  ...                            │
├─────────────────────────────────┤
│  Mystery Box Showcase           │
│  [Large highlight card]         │
├─────────────────────────────────┤
│  Trust Section                  │
│  [Badge] [Badge]                │
│  [Badge] [Badge]                │
├─────────────────────────────────┤
│  Newsletter                     │
│  [Email input] [CTA]            │
├─────────────────────────────────┤
│  Footer                         │
└─────────────────────────────────┘
```

### Desktop (≥ 1024px)

```
┌─────────────────────────────────────────────────────────┐
│  Top banner (inline info)                               │
├─────────────────────────────────────────────────────────┤
│  Navbar (full)                                          │
├─────────────────────────────────────────────────────────┤
│  Hero Section (split)                                   │
│  ┌────────────────────┬────────────────────────┐        │
│  │ Left:              │ Right:                 │        │
│  │ Title + copy       │ Large image carousel   │        │
│  │ [CTA] [CTA]        │ or product preview     │        │
│  │                    │                        │        │
│  │ Stats grid (4 cols)│                        │        │
│  └────────────────────┴────────────────────────┘        │
├─────────────────────────────────────────────────────────┤
│  Categories Grid (6 columns)                            │
│  [Card] [Card] [Card] [Card] [Card] [Card]              │
├─────────────────────────────────────────────────────────┤
│  Flash Deals Section (Scroll →)                         │
│  Heading + timer | [Card] [Card] [Card] [Card] ...      │
├─────────────────────────────────────────────────────────┤
│  Collections Carousel (Scroll →)                        │
│  [Large] [Large] [Large] ...                            │
├─────────────────────────────────────────────────────────┤
│  Bundle Deals Grid (3 columns)                          │
│  [Card] [Card] [Card]                                   │
│  [Card] [Card] [Card]                                   │
├─────────────────────────────────────────────────────────┤
│  Featured Products Grid (4 columns)                     │
│  [Card] [Card] [Card] [Card]                            │
│  [Card] [Card] [Card] [Card]                            │
│  [Card] [Card] [Card] [Card]                            │
├─────────────────────────────────────────────────────────┤
│  Mystery Box Showcase (Split or Full)                   │
│  [Large highlight + features]                          │
├─────────────────────────────────────────────────────────┤
│  Trust Section (4 columns)                              │
│  [Badge] [Badge] [Badge] [Badge]                        │
├─────────────────────────────────────────────────────────┤
│  Newsletter                                             │
│  [Email input] [CTA]                                    │
├─────────────────────────────────────────────────────────┤
│  Footer                                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Specifications

### 1. Hero Section

**File**: `src/components/home/HeroSectionV2.tsx`  
**Reusable**: Yes  
**Props**:

```typescript
interface HeroSectionV2Props {
  variant?: 'default' | 'carousel'; // Default: split layout, Carousel: auto-rotating
  title: string;
  subtitle: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  backgroundImage?: string;
  stats?: Array<{ value: string; label: string }>;
  testimonial?: { quote: string; author: string };
}
```

**Design**:
- **Desktop**: 50/50 split (left: text, right: image carousel)
- **Mobile**: Full-width, vertical stack
- **Height**: 520px (desktop), 70vh (mobile)
- **Colors**: Dark background (slate-950) with gradient overlay
- **Stats**: 4-column grid at bottom (desktop only)

**Features**:
- [ ] Auto-rotating carousel (desktop only)
- [ ] Smooth image transitions (850ms)
- [ ] Golden accents (#d6b25e) for premium feel
- [ ] Responsive typography scaling
- [ ] Animated stats counter
- [ ] Mobile-optimized touch targets

**Code Location**: `src/components/home/HeroSectionV2.tsx`

---

### 2. Categories Grid

**File**: `src/components/marketplace/CategoriesGrid.tsx`  
**Reusable**: Yes  
**Props**:

```typescript
interface CategoriesGridProps {
  categories: MarketplaceCategory[];
  columns?: { mobile: 2 | 3; tablet: 3 | 4; desktop: 4 | 6 };
  variant?: 'default' | 'compact' | 'featured';
  onCategoryClick?: (category: MarketplaceCategory) => void;
}
```

**Design**:
- **Columns**: 2 (mobile), 4 (tablet), 6 (desktop)
- **Gap**: 16px (mobile), 12px (desktop)
- **Card**: Image + icon + label + subtitle
- **Hover**: Scale 1.02, shadow increase, overlay fade
- **Border radius**: 16px

**Features**:
- [ ] Image backgrounds with gradient overlay
- [ ] Icon badges (already in data)
- [ ] Smooth hover animations
- [ ] Responsive column layout
- [ ] Touch-friendly on mobile (no hover effects)
- [ ] Link to `/products?category={slug}`

**Code Location**: `src/components/marketplace/CategoriesGrid.tsx`

---

### 3. Flash Deals Section

**File**: `src/components/marketplace/FlashDealsSection.tsx`  
**Reusable**: Yes  
**Props**:

```typescript
interface FlashDealsSectionProps {
  deals: Deal[];
  title?: string;
  subtitle?: string;
  showTimer?: boolean;
  cardsPerRow?: { mobile: 2; tablet: 3; desktop: 4 };
  onViewAll?: () => void;
}
```

**Design**:
- **Mobile**: Horizontal scroll (no columns)
- **Desktop**: Grid (3-4 columns)
- **Card**: Same as ProductCard but with countdown timer
- **Header**: Title + countdown timer (global)
- **CTA**: "View all flash deals" link

**Features**:
- [ ] Global countdown timer (updates every second)
- [ ] Horizontal scroll snap on mobile
- [ ] Discount badge with pulse animation
- [ ] Stock progress bar
- [ ] Urgent indicators ("Only 3 left")
- [ ] Link to `/deals` on "View all"

**Code Location**: `src/components/marketplace/FlashDealsSection.tsx`

---

### 4. Collections Carousel

**File**: `src/components/marketplace/CollectionsCarousel.tsx`  
**Reusable**: Yes  
**Props**:

```typescript
interface CollectionsCarouselProps {
  collections: Collection[];
  autoPlay?: boolean;
  autoPlayInterval?: number; // ms
}
```

**Design**:
- **Mobile**: Horizontal scroll (1 card visible + gap for next)
- **Desktop**: 3 cards visible, horizontal scroll
- **Card**: Large image (aspect ratio 1:1.2) + overlay gradient + text + CTA
- **Navigation**: Left/right arrows (desktop only)

**Features**:
- [ ] Smooth horizontal scroll
- [ ] Image overlay with gradient
- [ ] Collection name + description overlay
- [ ] "Explore" CTA button
- [ ] Touch scroll on mobile
- [ ] Arrow buttons on desktop
- [ ] Responsive card sizing

**Code Location**: `src/components/marketplace/CollectionsCarousel.tsx`

---

### 5. Bundle Deals Section

**File**: `src/components/marketplace/BundleDealsSection.tsx`  
**Reusable**: Yes  
**Props**:

```typescript
interface BundleDealsProps {
  bundles: Bundle[];
  title?: string;
  cardsPerRow?: { mobile: 2; tablet: 2; desktop: 3 };
}
```

**Design**:
- **Columns**: 2 (mobile), 3 (desktop)
- **Card**: Product images grid + bundle info + savings display
- **Layout**: Horizontal scroll on mobile, grid on desktop

**Features**:
- [ ] Multiple product preview images
- [ ] Total savings calculation
- [ ] Price comparison (original vs bundle)
- [ ] Discount percentage badge
- [ ] "Save {X}%" CTA
- [ ] Link to bundle detail page

**Code Location**: `src/components/marketplace/BundleDealsSection.tsx`

---

### 6. Featured Products Grid

**File**: `src/components/marketplace/FeaturedProductsGrid.tsx`  
**Reusable**: Yes (uses existing ProductCard)  
**Props**:

```typescript
interface FeaturedProductsGridProps {
  products: Product[];
  title?: string;
  cardsPerRow?: { mobile: 2; tablet: 3; desktop: 4 };
  showViewAll?: boolean;
}
```

**Design**:
- **Columns**: 2 (mobile), 3 (tablet), 4 (desktop)
- **Card**: Existing ProductCard component (reuse!)
- **Header**: Title + "View all" link

**Features**:
- [ ] Responsive grid layout
- [ ] Smooth staggered animations on load
- [ ] "View all products" link to `/products`

**Code Location**: Use existing ProductCard, wrap in `src/components/marketplace/FeaturedProductsGrid.tsx`

---

### 7. Mystery Box Showcase

**File**: `src/components/marketplace/MysteryBoxShowcase.tsx`  
**Reusable**: Yes  
**Props**:

```typescript
interface MysteryBoxShowcaseProps {
  box: MysteryBox;
  boxes?: MysteryBox[]; // For multiple boxes carousel
  layout?: 'featured' | 'carousel'; // Featured: full-width, Carousel: scroll
}
```

**Design**:
- **Full-width** card with premium styling
- **Colors**: Deep navy background (#0F172A) with gold accents
- **Layout**: Image on right (desktop), full-width (mobile)
- **Content**: Title, description, value label, CTA
- **Emojis**: Treasure/luxury themed

**Features**:
- [ ] Premium dark background with gradient
- [ ] Golden accent borders and text
- [ ] Large product preview images
- [ ] Urgency indicators (stock count)
- [ ] "Open your box" CTA button
- [ ] Animated elements (floating, pulse)

**Code Location**: `src/components/marketplace/MysteryBoxShowcase.tsx`

---

### 8. Trust Section

**File**: `src/components/marketplace/TrustSection.tsx`  
**Reusable**: Yes  
**Props**:

```typescript
interface TrustSectionProps {
  badges: TrustBadge[];
  columns?: { mobile: 2; tablet: 2; desktop: 4 };
}

interface TrustBadge {
  icon: React.ReactNode;
  title: string;
  description: string;
  emoji?: string;
}
```

**Design**:
- **Columns**: 2 (mobile), 4 (desktop)
- **Card**: Icon + title + description
- **Style**: Subtle card with hover effect
- **Icons**: lucide-react icons

**Features**:
- [ ] Security/shield icon
- [ ] Delivery truck icon
- [ ] Return package icon
- [ ] Verified seller icon
- [ ] Smooth hover animations
- [ ] Clear, readable text

**Code Location**: `src/components/marketplace/TrustSection.tsx`

---

### 9. Newsletter Section

**File**: `src/components/marketplace/NewsletterSection.tsx`  
**Reusable**: Yes  
**Props**:

```typescript
interface NewsletterProps {
  title?: string;
  subtitle?: string;
  onSubscribe?: (email: string) => void;
}
```

**Design**:
- **Layout**: Centered, minimal
- **Input**: Large email field (48px height)
- **Button**: Primary CTA button
- **Mobile**: Full-width input, stacked layout
- **Desktop**: Inline layout (input + button side-by-side)

**Features**:
- [ ] Email validation
- [ ] Success message after subscribe
- [ ] Error handling (duplicate email)
- [ ] Responsive layout
- [ ] Accessibility labels

**Code Location**: `src/components/marketplace/NewsletterSection.tsx`

---

## 📋 Implementation Checklist

### Create Components

- [ ] `CategoriesGrid.tsx` - Category card grid with responsive columns
- [ ] `FlashDealsSection.tsx` - Flash deals with horizontal scroll
- [ ] `CollectionsCarousel.tsx` - Collections showcase carousel
- [ ] `BundleDealsSection.tsx` - Bundle deals with product grid preview
- [ ] `FeaturedProductsGrid.tsx` - Wrapper for featured products
- [ ] `MysteryBoxShowcase.tsx` - Premium mystery box section
- [ ] `TrustSection.tsx` - Trust badges (delivery, returns, security, verified)
- [ ] `NewsletterSection.tsx` - Email signup form
- [ ] `HeroSectionV2.tsx` - Enhanced hero (or update existing)

### Update Home Page

- [ ] Restructure `src/app/page.tsx` with new layout
- [ ] Import all new components
- [ ] Pass correct props and data
- [ ] Update responsive classes
- [ ] Remove old/redundant sections
- [ ] Add proper spacing between sections

### Styling & Polish

- [ ] Verify Tailwind classes match design system
- [ ] Add responsive breakpoint utilities
- [ ] Implement hover states and animations
- [ ] Test on 390px, 640px, 1024px, 1440px screens
- [ ] Verify color contrast (WCAG AA)
- [ ] Test touch interactions (mobile)

### Data & Props

- [ ] Update data sources (use `marketplaceData.ts`)
- [ ] Create mock data if needed
- [ ] Pass all required props to components
- [ ] Verify TypeScript types

### Testing

- [ ] Visual regression testing (before/after)
- [ ] Mobile device testing (iPhone SE, Pixel 4)
- [ ] Desktop testing (Chrome, Firefox, Safari)
- [ ] Performance audit (Lighthouse)
- [ ] Accessibility audit (WCAG AA)
- [ ] Cross-browser testing

---

## 🎨 Tailwind Classes Reference

### Spacing
```
px-4 (mobile), px-8 (desktop)
py-6, py-8, py-10, py-12
gap-4, gap-6, gap-8
```

### Columns
```
grid-cols-2 (mobile)
md:grid-cols-3 (tablet)
lg:grid-cols-4 (desktop)
lg:grid-cols-6 (extra columns)
```

### Typography
```
text-2xl font-bold (headings)
text-base font-medium (body)
text-sm text-muted-foreground (secondary)
```

### Colors
```
bg-white / bg-slate-50
text-slate-900 / text-slate-700
accent colors: #0f5d43, #d6b25e, #1255a0
```

### Animations
```
transition-all duration-300
hover:scale-102 hover:shadow-lg
group-hover:opacity-100
animate-shimmer
```

---

## 📱 Mobile Considerations

### Touch Targets
- All buttons: min 48px height
- All links: min 44px tap area
- Gap between touch targets: min 8px

### Scroll Performance
- Use `overflow-x-auto no-scrollbar` for horizontal scroll
- Add `snap-type: x mandatory` for smooth scroll
- Use `scroll-snap-align: start` on cards

### Layout
- No horizontal scroll (except intentional carousels)
- Full-width containers with 16px padding
- Vertical stacking of sections
- Sticky CTA buttons on product sections

### Typography
- Min font size: 14px
- Max font size: 32px (for headings)
- Line height: 1.5+ for readability
- Sufficient touch padding around text

---

## 🚀 Deployment Steps

1. **Create feature branch**: `git checkout -b feat/home-page-redesign`
2. **Implement components** (following specs above)
3. **Update home page** layout in `src/app/page.tsx`
4. **Test responsive** at 390px, 640px, 1024px, 1440px
5. **Performance audit** (Lighthouse)
6. **Accessibility audit** (WCAG AA)
7. **Create PR** with before/after screenshots
8. **Deploy to staging** for review
9. **Merge to main** after approval
10. **Deploy to production**

---

## 📊 Success Criteria

### Functional
- [x] All sections render without errors
- [x] No console warnings
- [x] All links work correctly
- [x] All CTAs tracked (if applicable)
- [x] Search still works
- [x] Cart functionality preserved

### Performance
- [x] Lighthouse Performance ≥ 80
- [x] LCP < 2.5s
- [x] CLS < 0.1
- [x] FID < 100ms

### UX
- [x] Responsive at 390px-1920px
- [x] Smooth animations
- [x] Clear visual hierarchy
- [x] High contrast text (WCAG AA)
- [x] Touch-friendly on mobile
- [x] Premium, polished appearance

### Business
- [x] Higher engagement (session duration)
- [x] Better product discoverability
- [x] Improved conversion rate
- [x] Reduced bounce rate

---

## 📞 Support & Questions

- **Design tokens**: See `tailwind.config.ts`
- **Component patterns**: See existing `ProductCard`, `FlashDealCard`
- **Data sources**: See `src/lib/marketplace-data.ts`
- **Types**: See `src/types/index.ts`

---

**Status**: Ready for Phase 1 implementation  
**Prepared By**: Kiro AI  
**Date**: July 26, 2026  
**Estimated Duration**: 4-5 days  
**Components to Build**: 9 major components
