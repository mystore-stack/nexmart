# Mobile Hero Component - Quick Start Guide

## 🚀 30-Second Overview

The Hero component is now **fully responsive** with automatic mobile/desktop switching.

- **Mobile (<768px)**: Clean vertical stack (badge → title → description → CTA)
- **Desktop (≥768px)**: Rich carousel with animations
- **Zero effort**: Just use `<HeroSection />` anywhere

---

## 📦 Installation

Already included. No additional dependencies needed.

Uses existing:
- `framer-motion` (v11.18.2)
- `lucide-react` (icons)
- `next/image` (Image component)

---

## 💻 Usage

### Default (Auto-Responsive)
```tsx
import { HeroSection } from '@/components/home/HeroSection';

export default function HomePage() {
  return <HeroSection />;
}
```

**Result**: Automatically mobile-first on small screens, carousel on desktop.

### Mobile-Only
```tsx
import { MobileHero } from '@/components/home/MobileHero';

export default function CustomPage() {
  return (
    <MobileHero
      badge="🎯 New"
      title="Premium Collection"
      description="Handpicked for you"
      ctaLabel="Shop Now"
      ctaHref="/products"
      backgroundImage="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80"
    />
  );
}
```

### Desktop-Only
```tsx
import { DesktopHero } from '@/components/home/DesktopHero';

export default function LandingPage() {
  return <DesktopHero />;
}
```

### With Optional Secondary CTA
```tsx
<MobileHero
  badge="✨ Limited Time"
  title="Your Headline"
  description="Your short description (1-2 lines)"
  ctaLabel="Primary Action"
  ctaHref="/primary"
  secondaryCTALabel="Secondary Action"
  secondaryCTAHref="/secondary"
  backgroundImage="https://..."
  overlayOpacity={0.6}
/>
```

---

## 📱 Mobile Props

```typescript
interface MobileHeroProps {
  badge?: string;              // "🎯 Limited Time"
  title: string;               // "Premium Collection"
  description: string;         // 1-2 lines max
  ctaLabel: string;            // "Shop Now"
  ctaHref: string;             // "/products"
  secondaryCTALabel?: string;   // Optional
  secondaryCTAHref?: string;    // Optional
  backgroundImage?: string;    // URL
  overlayOpacity?: number;     // 0-1 (default: 0.55)
}
```

---

## 🎨 Design Specs (Mobile)

| Property | Value |
|----------|-------|
| Height | `min-h-[70vh]` |
| Padding | `px-4 py-6` |
| Border radius | `rounded-2xl` |
| Title size | `text-3xl font-bold` |
| Description size | `text-sm` |
| CTA width | `w-full` |
| CTA height | `py-3` |
| CTA border radius | `rounded-xl` |
| Gap between elements | `gap-4` (16px) |

---

## 🎯 Key Features

### Mobile ✨
- Vertical stack layout
- Staggered animations (500ms total)
- Responsive typography
- Full-width CTAs
- Subtle background pan (20s loop)
- No horizontal scroll at 390px

### Desktop ✨
- 3-slide carousel
- Auto-rotation every 5.5s (pauseable on hover)
- Navigation arrows + dot indicators
- Product preview card
- Trust badges
- Floating animations

---

## 🔧 Customization

### Change Mobile Breakpoint
Edit `src/components/home/HeroSection.tsx`:
```typescript
// Line 16: Change 768 to your preferred breakpoint
setIsMobile(window.innerWidth < 1024); // 1024px instead
```

### Adjust Animation Timing
Edit `src/components/home/MobileHero.tsx`:
```typescript
// Line 25: Change stagger delay
staggerChildren: 0.15, // 0.1 default → 0.15
delayChildren: 0.3,    // 0.2 default → 0.3
```

### Modify Background Pan Speed
Edit `src/components/home/MobileHero.tsx`:
```typescript
// Line 48: Change duration
duration: 25, // 20 default → 25 seconds
```

### Adjust Overlay Darkness
```tsx
<MobileHero overlayOpacity={0.7} /> {/* 70% instead of 55% */}
```

---

## ✅ Testing Checklist (5 mins)

### Mobile (iPhone SE)
- [ ] Open DevTools → Device toolbar → iPhone SE
- [ ] Scroll horizontally → no overflow
- [ ] Reload → animations play smoothly
- [ ] Click CTA → navigates correctly

### Desktop (1440px)
- [ ] Open DevTools → responsive mode → 1440x900
- [ ] Hover over hero → carousel pauses
- [ ] Reload → carousel auto-rotates
- [ ] Click navigation → smooth transitions

### Resize (Responsive)
- [ ] Open DevTools → responsive mode
- [ ] Drag handle to 767px → shows MobileHero
- [ ] Drag handle to 768px → shows DesktopHero
- [ ] No layout jank or white flash

---

## 📊 File Structure

```
src/components/home/
├── MobileHero.tsx       ← Mobile component
├── DesktopHero.tsx      ← Desktop component
├── HeroSection.tsx      ← Responsive wrapper (use this!)
├── index.ts             ← Exports
└── (other components)
```

**Import Path**: `@/components/home/HeroSection`

---

## 🎬 Animation Details

### Mobile (Staggered Entry)
```
Badge:       0ms   (fade in + slide down)
Title:     +100ms   (fade in + slide down)
Description:+100ms  (fade in + slide down)
CTAs:      +100ms   (fade in + slide down)
```

### Background (Continuous)
```
Loop: scale 1.00 → 1.02 → 1.00 (20 seconds)
Repeats infinitely
```

---

## 🚨 Common Issues

### Horizontal scroll on mobile?
- Check `px-4` padding is present
- Verify no absolute positioning on edges
- Test at exactly 390px (DevTools device toolbar)

### Animation jank?
- Open DevTools → Performance tab
- Record → should see 60fps frames
- Check for long JavaScript tasks

### Breakpoint not switching?
- Open DevTools → Console
- Type `window.innerWidth` and press Enter
- Should be <768 (mobile) or ≥768 (desktop)

### Animations not playing?
- Check browser supports CSS transforms
- Verify `framer-motion` is installed (`npm list framer-motion`)
- Check for `prefers-reduced-motion` media query

---

## 📚 Full Documentation

- **Design System**: See `MOBILE_HERO_GUIDE.md`
- **Testing**: See `MOBILE_HERO_TESTING_CHECKLIST.md`
- **Implementation**: See `MOBILE_HERO_IMPLEMENTATION_SUMMARY.md`

---

## 🔗 Related Files

- `src/components/home/MobileHero.tsx` - Mobile component source
- `src/components/home/DesktopHero.tsx` - Desktop component source
- `src/components/home/HeroSection.tsx` - Responsive wrapper
- `src/app/page.tsx` - Current usage (desktop homepage)

---

## ❓ FAQ

**Q: Do I need to change my current code?**  
A: No! If you're using `<HeroSection />`, it's already responsive. Old code works as-is.

**Q: Can I use just the mobile version?**  
A: Yes! Import `<MobileHero />` directly and customize props.

**Q: What's the browser support?**  
A: Chrome, Firefox, Safari, Edge (all latest 2 versions). Mobile browsers too.

**Q: Will this affect my Core Web Vitals?**  
A: Should improve! Images are eager-loaded, animations are GPU-accelerated.

**Q: Can I customize the copy?**  
A: Yes! Use `MobileHero` with custom props, or admin CMS integration (future).

---

## 🎯 Next Steps

1. **Review** the designs in `MOBILE_HERO_GUIDE.md`
2. **Test** using `MOBILE_HERO_TESTING_CHECKLIST.md`
3. **Deploy** when ready
4. **Monitor** conversion metrics

---

**Questions?** Refer to full documentation or check component source code (well-commented).
