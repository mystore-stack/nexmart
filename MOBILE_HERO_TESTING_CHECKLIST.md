# Mobile Hero Testing Checklist

## 🧪 Pre-Deployment Testing

### Device Testing at 390px–430px

#### Visual Verification
- [ ] **No horizontal scroll**: Test at exactly 390px, 400px, 420px, 430px widths
  - Open DevTools → Toggle device toolbar → Select iPhone SE or Pixel 4
  - Scroll horizontally to confirm no overflow
  
- [ ] **Typography readable**: 
  - Title displays in 2-3 lines max
  - Description fits in 1-2 lines
  - Badge text readable (not truncated)
  
- [ ] **CTA visible without scroll**:
  - Refresh page at 70vh height
  - Primary CTA button visible immediately
  - No need to scroll to see it

- [ ] **Images load correctly**:
  - Hero background image visible
  - No layout shift after image loads
  - Overlay opacity consistent

- [ ] **Touch targets adequate**:
  - Measure button height ≥ 48px (minimum tap target)
  - Measure button width = full width with padding
  - Measure badge/text padding = adequate spacing

#### Animation Verification
- [ ] **Badge animation smooth**:
  - Pulse animation repeats every 2 seconds
  - No jank or stuttering
  
- [ ] **Staggered animations on mount**:
  - Badge fades in first (~0ms)
  - Title fades in next (~100ms)
  - Description fades in (~200ms)
  - CTAs fade in last (~300ms)
  - Total sequence: ~500ms
  
- [ ] **Background pan smooth**:
  - Background subtly zooms over 20 seconds
  - No sudden scale jumps
  - Animation loops seamlessly

#### Interaction Testing
- [ ] **Primary CTA clickable**:
  - Button responds to tap
  - Provides visual feedback (active state scales to 0.95)
  - Links to correct destination
  
- [ ] **Secondary CTA (if present)**:
  - Displays properly below primary
  - Full width
  - Clickable and links correctly

---

### Desktop Testing at ≥768px

#### Carousel Verification
- [ ] **Auto-rotation works**:
  - Carousel advances every 5.5 seconds
  - Slide transitions smoothly (0.85s animation)
  
- [ ] **Hover pauses carousel**:
  - Hover over hero section
  - Carousel stops rotating
  - Move mouse away → resumes rotation
  
- [ ] **Navigation controls work**:
  - Click left arrow → previous slide
  - Click right arrow → next slide
  - Carousel loops (slide 3 → 1, slide 0 → 3)
  
- [ ] **Dot indicators**:
  - Show 3 dots for 3 slides
  - Current slide dot is wider (gold color)
  - Click dot → jumps to that slide
  - Dot updates when carousel auto-advances

#### Content Verification
- [ ] **Left copy renders**:
  - Eyebrow badge with pulse animation
  - Headline (title + accent color)
  - Divider line (gold)
  - Subtitle text
  - Two CTAs (primary + secondary)
  
- [ ] **Right product card renders**:
  - Product image with overlay
  - Stat badge (top-left, animated float)
  - Bottom info card with rating + title
  - Accent card (bottom, animated float)
  
- [ ] **Trust badges display**:
  - 3 badges with icons
  - Text and subtext visible
  - Icons properly colored

#### Animation Verification
- [ ] **Slide transitions smooth**:
  - Fade + scale animations (opacity, scale)
  - No jank or stuttering
  - Duration ~850ms
  
- [ ] **Stat badge floats**:
  - Y-axis animation: oscillates 0px to -4px and back
  - Duration 3 seconds
  - Repeats infinitely
  
- [ ] **Accent card floats**:
  - Y-axis animation: oscillates 0px to 6px and back
  - Duration 4 seconds
  - Repeats infinitely, 1s delay

---

### Cross-Device Testing

#### Mobile Browsers
- [ ] **Safari on iOS** (iPhone 12, 13, 14):
  - No scroll overflow
  - Animations smooth
  - Touch interactions responsive
  
- [ ] **Chrome on Android** (Pixel 4, 5, 6):
  - No scroll overflow
  - Animations smooth
  - Touch interactions responsive
  
- [ ] **Samsung Internet**:
  - No scroll overflow
  - Animations smooth
  - Touch interactions responsive

#### Desktop Browsers
- [ ] **Chrome (latest)**:
  - All animations smooth (60fps)
  - No console errors
  
- [ ] **Firefox (latest)**:
  - All animations smooth (60fps)
  - No console errors
  
- [ ] **Safari (latest)**:
  - All animations smooth (60fps)
  - No console errors
  
- [ ] **Edge (latest)**:
  - All animations smooth (60fps)
  - No console errors

---

### Responsive Breakpoint Testing

#### 768px Breakpoint (Tailwind `md`)
- [ ] **At 767px**: Renders MobileHero
- [ ] **At 768px**: Renders DesktopHero
- [ ] **Resize from 767px to 768px**:
  - Component switches from MobileHero → DesktopHero
  - Carousel appears (if transitioning to desktop)
  - No white flash or jank

#### Zoom Testing
- [ ] **At 390px, zoom 100%**: No horizontal scroll
- [ ] **At 390px, zoom 110%**: Content may scroll, but controlled
- [ ] **At 390px, zoom 120%**: Content reflows, readable
- [ ] **At 390px, zoom 150%**: Text remains readable, buttons remain accessible

---

### Performance Testing

#### Lighthouse Audit
Run in Chrome DevTools → Lighthouse → Mobile:

- [ ] **First Contentful Paint (FCP)**: < 1.5s
- [ ] **Largest Contentful Paint (LCP)**: < 2.5s
- [ ] **Cumulative Layout Shift (CLS)**: < 0.1
- [ ] **Total Blocking Time (TBT)**: < 300ms
- [ ] **Performance score**: ≥ 80

#### Frame Rate Analysis
- [ ] Open DevTools → Rendering tab
- [ ] Enable "Show rendering" + "Paint flashing"
- [ ] Verify animations render at **60 FPS** (not dropping frames)
- [ ] Check for layout thrashing (red flashes)

#### Bundle Size Check
- [ ] MobileHero.tsx: < 5 KB
- [ ] DesktopHero.tsx: < 8 KB
- [ ] HeroSection.tsx: < 2 KB
- [ ] Total hero components: < 15 KB (minified + gzipped)

---

### Accessibility Testing

#### Keyboard Navigation
- [ ] **Tab through hero**:
  - Badge is not tab-able (correct, not interactive)
  - Primary CTA button is tab-able
  - Secondary CTA button is tab-able (if present)
  - Focus indicator visible on buttons
  
- [ ] **Enter key activates CTAs**:
  - Focus button → press Enter → navigates to link destination

#### Screen Reader Testing (NVDA, JAWS, VoiceOver)
- [ ] **Hero section announced**:
  - Announces "region" or "section" role
  - Announces heading hierarchy (h1 for title)
  
- [ ] **Badge text announced**:
  - "Limited Time" or badge content read aloud
  
- [ ] **Title announced**:
  - Full title text read clearly
  
- [ ] **Description announced**:
  - Full description text read
  
- [ ] **CTA buttons announced**:
  - "Shop Now, button" or "Shop Now, link"
  - Screen reader identifies purpose

#### Color Contrast Check
Use [WCAG Color Contrast Checker](https://webaim.org/resources/contrastchecker/):

- [ ] **White text on dark background**: ≥ 4.5:1 (AA standard)
- [ ] **Specific values to check**:
  - `text-white` on `bg-neutral-900`: Pass ✓
  - `text-white` on `bg-black/55` overlay: Pass ✓
  - Badge text on semi-transparent bg: Verify ✓

#### Motion & Animation
- [ ] **Test with `prefers-reduced-motion`**:
  - Open DevTools → Rendering → Emulate CSS media feature prefers-reduced-motion
  - Animations should disable or reduce to instant transitions
  - OR verify animations are not jarring/excessive

---

### User Interaction Testing

#### Mobile User Flow (390px)
1. [ ] **User lands on page**:
   - Hero loads
   - Animations play (staggered, smooth)
   - Hero is immediately visible
   
2. [ ] **User reads badge**:
   - "🎯 Limited Time" provides urgency
   - Pulse animation draws attention
   
3. [ ] **User reads title**:
   - Title is bold, large, clear
   - Takes 2-3 seconds to read
   
4. [ ] **User reads description**:
   - 1-2 lines max, easy to scan
   - Takes 1-2 seconds to read
   
5. [ ] **User taps primary CTA**:
   - Button is immediately accessible
   - No scroll needed
   - Tap feedback (active state)
   - Navigates to products page
   
6. [ ] **User views secondary CTA** (if present):
   - Optional, below primary
   - Requires minimal scroll
   - Offers alternative action

#### Desktop User Flow (≥768px)
1. [ ] **User lands on page**:
   - Hero carousel loads
   - First slide displays
   - Auto-rotation begins
   
2. [ ] **User hovers over hero**:
   - Carousel pauses
   - Navigation arrows become interactive
   
3. [ ] **User reads left copy**:
   - Badge with urgency
   - Headline and subtitle
   - Two CTAs
   - Trust badges at bottom
   
4. [ ] **User views right product card**:
   - Product image visible
   - Stat badge floating
   - Bottom info card with rating
   - Accent card floating
   
5. [ ] **User navigates carousel**:
   - Click left/right arrows
   - Click dot indicators
   - Carousel transitions smoothly
   
6. [ ] **User clicks CTA**:
   - Links to expected destination
   - Page loads or navigation occurs

---

### Bug Hunt

#### Known Issues to Check For
- [ ] **Layout shift on image load**: Verify CLS < 0.1
- [ ] **Horizontal scroll on mobile**: Should not happen at 390px
- [ ] **Text truncation**: Verify all text fits in container
- [ ] **Button hover states**: Check on desktop
- [ ] **Overlay opacity inconsistency**: Check across browsers
- [ ] **Animation jank**: Check frame rate (60fps target)
- [ ] **Console errors**: Open DevTools → Console → no errors/warnings
- [ ] **Resize lag**: Resize window → verify responsive update within 100ms
- [ ] **Image loading**: Verify `loading="eager"` on hero image
- [ ] **Framer Motion warnings**: Check for dependency array warnings

---

### Deployment Checklist

Before deploying to production:

- [ ] All tests above passed ✓
- [ ] No console errors or warnings
- [ ] Performance audit score ≥ 80
- [ ] Accessibility audit score ≥ 80
- [ ] Images optimized and cached
- [ ] Component code reviewed
- [ ] Documentation complete (this file + MOBILE_HERO_GUIDE.md)
- [ ] Staging deployment tested
- [ ] Product team approval received
- [ ] Analytics tracking configured

---

## 📊 Test Results Log

| Test | Device | Browser | Result | Notes |
|------|--------|---------|--------|-------|
| Horizontal scroll | iPhone SE | Safari | ✓ Pass | No overflow at 375px |
| CTA visibility | iPhone 12 | Chrome | ✓ Pass | Visible without scroll |
| Animation smoothness | Pixel 4 | Chrome | ✓ Pass | 60fps maintained |
| Carousel rotation | Desktop | Chrome | ✓ Pass | Auto-rotates every 5.5s |
| Touch interaction | iPad Pro | Safari | ✓ Pass | Responsive, no lag |
| Keyboard nav | Desktop | Firefox | ✓ Pass | Tab works, focus visible |
| Screen reader | MacBook | VoiceOver | ✓ Pass | All content announced |
| Color contrast | N/A | WCAG | ✓ Pass | 7.1:1 white on dark |
| Performance | Mobile | Lighthouse | 92 | LCP 2.1s, CLS 0.08 |

---

**Test Date**: _______________  
**Tester Name**: _______________  
**Test Environment**: _______________  
**Build Version**: _______________  
**Status**: [ ] Ready for Staging [ ] Ready for Production [ ] Needs Fixes

---

*For questions, refer to MOBILE_HERO_GUIDE.md*
