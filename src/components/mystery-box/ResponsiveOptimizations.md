# Mobile Responsive Design Optimizations

## Target Viewport Sizes
- Small phones: 320px - 375px
- Standard phones: 390px - 430px (primary target)
- Large phones: 430px - 600px
- Tablets: 600px+

## Implemented Optimizations

### 1. MysteryBoxHeader
```css
/* Mobile optimized spacing */
- px-4: 16px horizontal padding on all sides
- py-3.5: 14px vertical padding
- Sticky positioning for easy navigation
- Touch-friendly icon sizes (20px minimum)
- 48px+ tap targets for buttons
```

**Responsive behavior:**
- Text shrinks on < 375px
- Flex layout centers items
- Cart badge appears on right

### 2. HeroSection
```css
/* Full-screen visual impact */
- h-80: 320px height (adjustable for different phones)
- rounded-3xl: Premium rounded corners
- mx-4: 16px margin maintains safe zones
- Animated geometric shapes scale on smaller screens
```

**Adaptive elements:**
- Icon size: 6xl (48px) on all phones
- Title font: text-4xl (36px) maintains readability
- Buttons: Full width with 8px padding

### 3. CategoryCards
```css
/* 2-column grid optimized for mobile */
- grid-cols-2: Always 2 columns on mobile
- gap-3: 12px spacing between cards
- Vertical stacking on very small screens
```

**Per-card sizing:**
- p-4: 16px padding inside each card
- Min-height via content flow
- Touch targets: 60px minimum height

### 4. PremiumBoxCard
```css
/* Full-width card layout */
- rounded-2xl: 16px border radius
- space-y-3: 12px gap between sections
- p-4: 16px padding

Card sections:
- Header: h-40 (160px) - Full-width gradient
- Content: Flexible spacing with 4px padding per item
- Buttons: Full width, 44px height minimum
```

**Responsive typography:**
- Title: text-xl (20px font)
- Subtitle: text-sm (14px font)
- Body text: text-sm (14px font)
- All readable at 390px+ screen

### 5. FlashDealsSection
```css
/* Horizontal card layout */
- p-3: Compact 12px padding
- flex items-center gap-3: Horizontal layout
- w-16 h-16: Compact 64x64px images
- Truncates text to fit narrow widths
```

**Mobile considerations:**
- Countdown timer remains visible
- Product image always visible
- Discount badge prominent

### 6. MysteryRevealSection
```css
/* 3x2 grid of reveal items */
- grid-cols-3: Three columns on all phones
- gap-3: 12px spacing
- aspect-square: Equal width/height for tap targets

Per-item sizing:
- Min width: ~100px (on 390px screen)
- Touch target: 44px+ minimum
- Tap to reveal animation works on small screens
```

### 7. CategoryCards
```css
/* 2-column category grid */
- Each card: ~165px wide on 390px screen
- p-4: 16px padding
- text-sm font for labels
```

### 8. TrustSection
```css
/* 2x2 grid of trust badges */
- grid-cols-2: Two columns on mobile
- gap-3: 12px spacing
- p-4: Content padding
- Icons: w-6 h-6 (24px) - Touch friendly
```

### 9. CustomerReviewsSection
```css
/* Full-width review cards */
- p-4: 16px padding
- flex gap-2: Horizontal avatar + content
- h-20: Compact 80px review image
- text-sm: Readable font size
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

### Button Sizing
All buttons follow 48px+ rule:
```
- py-3: 12px top/bottom padding
- px-4+: 16px+ left/right padding
- min-height: 48px
- min-width: 48px
- Rounded corners for tap friendliness
```

## Animation Performance

### Mobile Optimizations
- Framer Motion configured for 60fps
- `will-change` applied to animated elements
- Minimal repaints during scroll
- GPU-accelerated transforms (scale, rotate, y)

### Reduced Motion Support
For users with `prefers-reduced-motion`:
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Animations automatically disabled
```

### Scroll Performance
- `whileInView` viewport triggers (not on every frame)
- `once: true` prevents re-animations
- Intersection Observer used efficiently

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
- lg: 16px
- xl: 24px
- 2xl: 32px

## Touch Interaction Guidelines

### Tap Targets
- Minimum 44x44px (iOS standard)
- 48x48px preferred
- 8px minimum spacing between targets
- No hover states on mobile (use active/focus)

### Swipe Gestures
- Horizontal scrolling: Category cards, reviews
- Vertical scrolling: Page sections
- Pull-to-refresh: Not implemented (use pagination)

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
- Image lazy loading
- Code splitting
- Minimal JavaScript
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
