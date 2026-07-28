# Deals Page - Testing & Quality Assurance Guide

## Quick Start Testing

### 1. Local Development
```bash
cd nexmart-ma1-main
npm run dev
# Navigate to http://localhost:3000/m/deals
```

### 2. Mobile Preview
- Chrome DevTools: Press F12 → Toggle device toolbar (Ctrl+Shift+M)
- Select "iPhone 12 Pro" (390px) as primary test device
- Responsive mode: 390px width

## Visual Inspection Checklist

### Header Section
- [ ] Back button appears and navigates to /m
- [ ] Title shows "Deals" with "Best offers every day" subtitle
- [ ] Search icon visible (clickable)
- [ ] Wishlist icon visible
- [ ] Cart icon visible with item count badge
- [ ] Header sticky on scroll
- [ ] No horizontal overflow

### Hero Banner
- [ ] Full-width banner displays with rounded corners
- [ ] Animated lightning bolt or icon visible
- [ ] Title "Flash Sale" centered and visible
- [ ] Subtitle "Up to 70% off" visible
- [ ] Countdown timer shows HH:MM:SS format
- [ ] Countdown updates every second
- [ ] "Shop Now" button visible and clickable
- [ ] Scroll indicator animates at bottom

### Category Cards
- [ ] 7 category cards display horizontally
- [ ] Horizontal scroll works smoothly
- [ ] Each category shows emoji, name, count
- [ ] Active category highlighted with red border
- [ ] Category badges interactive (click changes filter)
- [ ] No text overflow
- [ ] 12px gap maintained between cards

### Flash Deals Cards
- [ ] Each card shows product image
- [ ] Discount badge visible (e.g., "-30%")
- [ ] Stock progress bar displays
- [ ] Stock bar color: green (>50%), yellow (20-50%), red (<20%)
- [ ] Countdown timer visible and updating
- [ ] Rating with stars visible
- [ ] "Sold" count displays
- [ ] Prices display in MAD currency with proper formatting
- [ ] "Add to Cart" button clickable
- [ ] "Urgent" badge shows when stock low
- [ ] "Sold Out" overlay when inventory = 0

### Bundle Deals Section
- [ ] "Bundle Deals" heading visible
- [ ] Each bundle shows: image, title, items preview
- [ ] Item count visible (e.g., "3 items included")
- [ ] Original vs. bundle price displayed
- [ ] Savings percentage shown in green
- [ ] Mini product images showing bundle contents
- [ ] Hover effect on cards

### Super Deals Section
- [ ] "🏆 Top Deals" heading visible
- [ ] 2-column grid displays correctly
- [ ] Each deal shows: image, title, prices, discount
- [ ] Star rating visible
- [ ] "View All" link appears if more than 4 deals
- [ ] Cards animate on scroll into view

### Sponsored Section
- [ ] "Trending Deals" heading visible
- [ ] Each sponsored item shows: image, title, brand
- [ ] "SPONSORED" badge visible
- [ ] Discount percentage highlighted
- [ ] Prices with original crossed out
- [ ] Shopping bag icon clickable

### Recommended Section
- [ ] "👤 Recommended For You" heading visible
- [ ] 2-column grid displays
- [ ] Each card shows: image, title, rating, prices
- [ ] Heart icon for wishlist (clickable)
- [ ] "Add" button functional
- [ ] Cards personalized or randomized

### Trust Section
- [ ] 4 trust badges display in 2x2 grid
- [ ] Each badge: icon, title, description
- [ ] Icons rotate on hover
- [ ] Badges have distinct colors
- [ ] NexStore branding visible at bottom

### Bottom CTA
- [ ] "Explore More Deals" section visible
- [ ] Animated dark gradient background
- [ ] "Continue Shopping" button clickable
- [ ] Text legible on dark background

## Responsive Design Tests

### Viewport Sizes to Test
```
1. iPhone 12 Mini: 375px ✓
2. iPhone 12/13/14: 390px ✓ (PRIMARY)
3. iPhone 15 Pro: 393px ✓
4. iPhone 12 Pro Max: 430px ✓ (MAX)
5. Pixel 4: 412px ✓
```

### Test Procedure for Each Size
```javascript
// DevTools Console
window.innerWidth  // Should match target
window.innerHeight // Should be ~800-900px

// Check body overflow
document.body.scrollWidth === window.innerWidth // Should be TRUE
```

## Interaction Tests

### Add to Cart Workflow
```
1. Scroll to Flash Deals
2. Click "Add to Cart" button on any card
3. Verify cart icon badge increments
4. Navigate to /m/cart
5. Verify product appears in cart
6. Check price and quantity
```

### Countdown Timer Test
```
1. Note current countdown time
2. Wait 5 seconds
3. Verify countdown decreased by ~5 seconds
4. Verify format: HH:MM:SS
5. Repeat several times
```

### Stock Progress Test
```
1. Identify card with partial stock
2. Verify progress bar width matches percentage
3. Check color: green (>50%), yellow (20-50%), red (<20%)
4. Verify "X sold" text matches progress
```

### Category Filter Test
```
1. Click "Flash Deals" category
2. Verify deals update (or filter applies)
3. Click "Electronics"
4. Verify category highlight changes
5. Try other categories
```

## Animation Performance Tests

### 1. Scroll Animations
```
- [ ] Hero section fades in on page load
- [ ] Category cards stagger-animate on scroll
- [ ] Deal cards fade in when scrolled into view
- [ ] No jank or stuttering
- [ ] 60fps on mobile devices (check DevTools)
```

### 2. Hover States
```
- [ ] Cards scale up on hover
- [ ] Icons rotate smoothly
- [ ] Color transitions smooth (no jumps)
- [ ] All animations within 300ms
```

### 3. Tap Feedback
```
- [ ] Buttons scale down on tap
- [ ] Visual feedback within 100ms
- [ ] Feedback clear on mobile
```

## Performance Tests

### Load Times
```bash
npm run build
# Test with Lighthouse in DevTools
# Target: Performance > 90

Expected metrics:
- FCP (First Contentful Paint): < 1.5s
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.1
- TTI (Time to Interactive): < 3.5s
```

### Image Loading
- [ ] Images lazy-load on scroll
- [ ] No layout shift when images load
- [ ] Placeholder gradients visible before image loads
- [ ] Images load from correct URLs
- [ ] Proper image dimensions

### Bundle Size
```bash
npm run build
# Check: .next/static/chunks/
# Target: deals code < 150KB
```

## Admin Integration Tests

### 1. Deal Creation Flow
```
1. Go to /admin/deals
2. Click "Create Deal"
3. Select product
4. Set discount: 30%
5. Set stock: 100
6. Set duration: 2 hours
7. Save
8. Go to /m/deals
9. Verify deal appears
10. Verify discount shows -30%
11. Verify countdown shows ~2 hours
```

### 2. Deal Editing
```
1. /admin/deals → Edit existing deal
2. Change discount to 50%
3. Save
4. Mobile page updates (within cache timeout)
5. Price recalculates: 50% OFF
```

### 3. Stock Tracking
```
1. Create deal with 100 stock
2. Mobile shows 100 in progress bar
3. Admin shows 100 remaining
4. Add to cart from mobile
5. Stock decrements (if backend updates it)
6. Progress bar reflects new stock
```

### 4. Pause/Resume
```
1. Active deal on mobile
2. Admin clicks "Pause"
3. Deal disappears from mobile
4. Admin clicks "Resume"
5. Deal reappears on mobile
```

## Accessibility Tests

### WCAG 2.1 Level AA
- [ ] All text 14px+ readable
- [ ] Color contrast 4.5:1 minimum
- [ ] Touch targets 44x44px minimum
- [ ] Focus visible on keyboard nav
- [ ] ARIA labels on icons
- [ ] Semantic HTML used

### Mobile Accessibility
- [ ] Works without JavaScript (graceful fallback)
- [ ] Screen readers can navigate
- [ ] Touch feedback immediate
- [ ] No color-only information
- [ ] Error messages clear

## Browser Compatibility

### Mobile Browsers
- [ ] iOS Safari 14+
- [ ] Chrome (Android)
- [ ] Firefox (Android)
- [ ] Samsung Internet

## Known Limitations & Workarounds

### Potential Issues

#### 1. Animations Feel Sluggish
- **Solution:** Reduce animation duration in components
- **Workaround:** Use `prefers-reduced-motion` media query

#### 2. Images Don't Load
- **Solution:** Check Cloudinary/CDN URLs
- **Workaround:** Use fallback placeholder images

#### 3. Cart Not Updating
- **Solution:** Clear browser cache and local storage
- **Workaround:** Hard refresh (Ctrl+Shift+R)

#### 4. Countdown Timer Jitters
- **Solution:** Use `setInterval` instead of frame-based calculations
- **Workaround:** Reload page if timer seems incorrect

## Deployment Checklist

### Code Quality
- [ ] No console errors or warnings
- [ ] ESLint passes (`npm run lint`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] No unused imports

### Performance
- [ ] Images optimized
- [ ] Code splitting enabled
- [ ] Lighthouse > 90
- [ ] FCP < 1.5s

### Functionality
- [ ] All deals display
- [ ] Add to cart works
- [ ] Responsive on all sizes
- [ ] Animations smooth
- [ ] Touch events work

### Mobile Specific
- [ ] Tested on real iOS device
- [ ] Tested on real Android device
- [ ] Bottom nav doesn't overlap
- [ ] Keyboard doesn't cover inputs
- [ ] Safe area respected

## Debug Commands

```javascript
// Check cart store
import { useCartStore } from "@/store/cart";
const store = useCartStore.getState();
console.log(store.items);

// Check viewport size
console.log(`${window.innerWidth}x${window.innerHeight}`);

// Check animation performance
let count = 0;
const start = performance.now();
const checkFPS = () => {
  count++;
  if (performance.now() - start > 1000) {
    console.log(`FPS: ${count}`);
    count = 0;
  }
  requestAnimationFrame(checkFPS);
};
checkFPS();
```

---

**Status:** Ready for Production  
**Last Updated:** July 26, 2024  
**Version:** 1.0
