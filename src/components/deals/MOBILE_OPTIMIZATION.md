# Deals Page - Mobile Optimization Guide

## Target Viewport Sizes
- Small phones: 320px - 375px
- Standard phones: 390px - 430px (primary target)
- Large phones: 430px - 600px
- Tablets: 600px+

## Implemented Optimizations

### 1. DealsHeader
```css
/* Mobile optimized spacing */
- px-4: 16px horizontal padding
- py-3.5: 14px vertical padding
- Sticky positioning for easy navigation
- Touch-friendly icon sizes (20px minimum)
- 48px+ tap targets for buttons
```

**Responsive behavior:**
- Text size: text-base (16px) for title
- Flex layout centers items
- Icons on right for easy thumb reach
- Cart badge appears without text overflow

### 2. HeroBanner
```css
/* Full-screen visual impact */
- h-72: 288px height (adaptive for phones)
- rounded-3xl: Premium rounded corners
- mx-4: 16px margin maintains safe zones
- Animated geometric shapes scale on smaller screens
```

**Adaptive elements:**
- Icon size: 12px (48px) on all phones
- Title font: text-4xl (36px) maintains readability
- Buttons: Full width with 8px padding
- Countdown: Visible font-mono with proper spacing

### 3. DealCategories
```css
/* Horizontal scroll optimized for mobile */
- Flex with overflow-x-auto
- Snap scrolling enabled (snap-x snap-mandatory)
- gap-3: 12px spacing between categories
- px-4/-mx-4 px-4: Maintains safe zones while allowing scroll
```

**Per-card sizing:**
- px-4 py-3: 16px/12px padding inside cards
- min-w-max: Prevents shrinking
- Touch targets: 60px minimum height
- Emoji text: text-2xl (24px) for visibility

### 4. FlashDealCard
```css
/* Full-width card layout on mobile */
- rounded-2xl: 16px border radius
- space-y-3: 12px gap between sections
- p-4: 16px padding inside card
- h-48: 192px image height (optimized)

Card sections:
- Image: Full container width, proper aspect ratio
- Badges: Positioned absolutely, visible without text cutoff
- Content: Flexible with proper spacing
- Button: Full width, 44px height minimum
```

**Responsive typography:**
- Title: text-sm (14px font)
- Prices: text-xl (20px font) for readability
- Labels: text-xs (12px font)
- All readable at 390px+ without zoom

### 5. BundleDealsSection
```css
/* Full-width bundle cards */
- p-4: 16px padding
- flex gap-4: Horizontal layout
- w-24 h-24: 96x96px images
- Responsive text with line-clamp
```

**Mobile considerations:**
- Flex direction: row (images left, content right)
- Text truncation: line-clamp prevents overflow
- Buttons: Touch-friendly size (40px+)

### 6. SuperDealsSection
```css
/* 2-column grid for deals */
- grid-cols-2: Two columns on mobile
- gap-3: 12px spacing
- h-32: 128px image height
- Proper aspect ratios maintained
```

### 7. SponsoredDealsSection
```css
/* Full-width sponsored cards */
- p-3: Compact 12px padding
- flex items-center gap-3: Horizontal layout
- w-20 h-20: Compact 80x80px images
- Truncates text to fit narrow widths
```

### 8. RecommendedDealsSection
```css
/* 2-column grid of recommendations */
- grid-cols-2: Two columns on mobile
- gap-3: 12px spacing
- h-32: 128px image height
- Proper text clipping

Per-item:
- Min width: ~165px (on 390px screen)
- Touch target: 44px+ buttons
- Responsive text sizing
```

### 9. TrustSection
```css
/* 2x2 grid of trust badges */
- grid-cols-2: Two columns on mobile
- gap-3: 12px spacing
- p-4: 16px content padding
- Icons: w-6 h-6 (24px) - Touch friendly
```

## Safe Area Considerations

### Viewport Layout
```
MobileLayout wrapper:
- max-w-sm: 24rem (384px) - Centered on desktop
- mx-auto: Centered
- min-h-screen: Full height

Sections use:
- px-4: 16px padding (leaves 368px content width on 390px screen)
- mx-auto: Auto margins for centering

Bottom nav:
- pb-20: 80px padding to avoid covering content
- Fixed positioning: Covers 80px at bottom
```

### Button Sizing Rules
All buttons follow 48px+ rule:
```
- py-3: 12px top/bottom padding (minimum)
- px-4+: 16px+ left/right padding
- min-height: 48px
- min-width: 48px (for icon buttons)
- Rounded corners for tap friendliness
```

## Animation Performance

### Mobile Optimizations
- Framer Motion configured for 60fps
- `will-change` applied to animated elements
- Minimal repaints during scroll
- GPU-accelerated transforms (scale, rotate, y)

### Scroll Performance
- `whileInView` viewport triggers (not on every frame)
- `once: true` prevents re-animations
- Intersection Observer used efficiently
- Lazy loading for images

### Reduced Motion Support
For users with `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
```

## Typography Scales

### Headings
- Page title: text-2xl (24px) font-black
- Section titles: text-xl (20px) font-bold
- Card titles: text-sm (14px) font-bold
- Labels: text-xs (12px) font-semibold

### Body Text
- Large body: text-sm (14px)
- Small text: text-xs (12px)
- All maintain 1.5 line-height minimum

### Spacing Scale
Following Tailwind's scale:
- xs: 2px
- sm: 4px
- md: 8px
- lg: 16px (main padding)
- xl: 24px
- 2xl: 32px

## Touch Interaction Guidelines

### Tap Targets
- Minimum 44x44px (iOS standard)
- 48x48px preferred
- 8px minimum spacing between targets
- No hover states on mobile (use active/focus)

### Swipe Gestures
- Horizontal scrolling: Category cards
- Vertical scrolling: Page sections
- Smooth momentum scrolling enabled

## Testing on Target Devices

### iPhone Sizes (390px focus)
- iPhone 12/13/14 Mini: 375px
- iPhone 12/13/14: 390px ← **PRIMARY TARGET**
- iPhone 15 Pro: 393px
- iPhone 12/13/14 Pro Max: 430px ← **MAX TARGET**

### Testing Checklist
- [ ] Text legible at 390px
- [ ] Buttons easily tappable
- [ ] No horizontal scrolling (except intentional)
- [ ] Images load fast (lazy load enabled)
- [ ] Animations smooth (60fps)
- [ ] Bottom nav doesn't cover content
- [ ] Keyboard doesn't cover inputs
- [ ] Touch feedback immediate (<100ms)

## Dark Mode Support

All components support light/dark via Tailwind:
- Text: `text-neutral-900` (light) / `text-white` (dark)
- Backgrounds: `bg-white` (light) / `bg-neutral-900` (dark)
- Borders: `border-neutral-100` (light) / `border-neutral-800` (dark)

## CSS Classes Used

### Consistent Patterns
```tsx
// Container padding
className="px-4 py-6"

// Full-width buttons
className="w-full py-3"

// Grid layouts
className="grid grid-cols-2 gap-3"

// Flex centering
className="flex items-center justify-between gap-2"

// Text truncation
className="truncate text-sm"

// Responsive text
className="text-xl sm:text-2xl"
```

## Performance Metrics

### Target Metrics (Mobile)
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s

### Optimization Techniques
- Image lazy loading via Next.js Image (where applicable)
- Code splitting via Next.js App Router
- Minimal JavaScript overhead
- CSS-in-JS compiled to CSS
- Framer Motion GPU acceleration

## Accessibility

### WCAG 2.1 Level AA Compliance
- Minimum 4.5:1 contrast ratio
- Touch targets 44x44px minimum
- Semantic HTML structure
- ARIA labels on icons
- Keyboard navigation supported
- Focus visible states

### Mobile Accessibility
- Large touch targets
- High contrast for outdoor readability
- No color-only information
- Readable fonts (14px+ minimum)
- Clear error messages
- Status updates announced

## Responsive Image Strategy

### Image Optimization
- Lazy loading enabled
- Proper aspect ratios maintained
- Placeholder backgrounds prevent CLS
- Responsive widths via srcset (future)
- Format conversion (webp with fallback)

### Image Sizes
- Thumbnail: 80-96px (sponsored, bundle preview)
- Card image: 128px height (grid cards)
- Flash deal: 192px height (larger cards)
- Hero banner: 288px height (full-width)
- Background images: Cover with gradient overlay

## Breakpoint Strategy

### Current Implementation
- Mobile-first: All base styles optimize for 390px
- Tablet: Auto-scales from 600px+ via grid/flex
- Desktop: Max-width container (via MobileLayout max-w-sm)

### Future Breakpoints (if desktop version needed)
```css
sm: 640px    - Small tablets
md: 768px    - Tablets
lg: 1024px   - Small desktops
xl: 1280px   - Desktops
2xl: 1536px  - Large desktops
```

## Performance Checklist

- [ ] All text readable without zoom at 390px
- [ ] Buttons easily tappable (48px+)
- [ ] No horizontal overflow
- [ ] Images optimized and lazy-loaded
- [ ] Animations smooth (60fps target)
- [ ] Scroll performance smooth
- [ ] Bottom nav doesn't overlap content
- [ ] Touch feedback immediate
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
