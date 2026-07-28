# NexStore Premium Category Section - Style Guide

---

## 🎨 VISUAL DESIGN SYSTEM

### Card Anatomy

```
┌─────────────────────────────────────────┐
│  ╭─────────────────────────────────────╮ │
│  │ Background Image (with parallax)    │ │
│  │ ┌─────────────────────────────────┐ │ │
│  │ │ Gradient Overlay (color-based)  │ │ │
│  │ │ ┌───────────────────────────────┤ │ │
│  │ │ │ Dark Overlay (readability)    │ │ │
│  │ │ │ ┌─────────────────────────────┤ │ │
│  │ │ │ │ Glassmorphic Layer (hover)  │ │ │
│  │ │ │ └─────────────────────────────┤ │ │
│  │ │ └───────────────────────────────┤ │ │
│  │ │ [Icon]     [Badge]              │ │ │
│  │ │                                 │ │ │
│  │ │ Category Name                   │ │ │
│  │ │ Tagline                         │ │ │
│  │ │ Explore →                       │ │ │
│  │ └─────────────────────────────────┘ │ │
│  ╰─────────────────────────────────────╯ │
│  Border Glow (hover)                    │
└─────────────────────────────────────────┘
```

---

## 🎬 ANIMATION STATES

### State 1: Default (At Rest)
```
Opacity:    1.0
Scale:      1.0
Icon Y:     0px
Title Y:    0px
Tagline Y:  0px
CTA:        Hidden (opacity 0)
Shadow:     Subtle (sm)
Glass:      Hidden (opacity 0)
Border:     Hidden (opacity 0)
Image:      Scale 1.0
```

### State 2: Hover (Desktop Only)
```
Opacity:    1.0
Scale:      1.0 (card stays same size)
Y Position: -8px (lifts)
Icon Y:     -8px (lifts with card)
Title Y:    -4px (subtle lift)
Tagline Y:  -2px (subtle lift)
CTA:        Visible (opacity 1, y: 0)
Arrow:      Slides right (+4px)
Shadow:     Large (lg)
Glass:      Visible (opacity 1)
Border:     Visible (opacity 1)
Image:      Scale 1.1 (parallax)
Duration:   200-300ms (smooth)
```

### State 3: Mobile Tap
```
Scale:      0.98 (press feedback)
Duration:   100ms
After tap:  Navigate to category
```

---

## 🎨 COLOR SPECIFICATIONS

### Primary Palette
```css
/* Text & Backgrounds */
Slate-900:   #0F172A (text, dark backgrounds)
Slate-950:   #020617 (darker overlays)
White:       #FFFFFF (cards, text)
Slate-600:   #475569 (secondary text)

/* Moroccan Accents */
Amber-600:   #D97706 (gold, featured category)
Amber-100:   #FEF3C7 (light amber background)
Blue-200:    #BFDBFE (light blue accent)
```

### Category Color Gradients
```
Electronics:
  from-blue-600     (#2563EB)
  to-cyan-600       (#0891B2)
  opacity: /10      (semi-transparent)

Fashion:
  from-pink-600     (#EC4899)
  to-rose-600       (#E11D48)
  opacity: /10

Beauty:
  from-purple-600   (#9333EA)
  to-pink-600       (#EC4899)
  opacity: /10

Home:
  from-orange-600   (#EA580C)
  to-amber-600      (#D97706)
  opacity: /10

Moroccan:
  from-amber-600    (#D97706)
  to-yellow-600     (#EABB08)
  opacity: /10

Gaming:
  from-green-600    (#16A34A)
  to-emerald-600    (#059669)
  opacity: /10

Deals:
  from-red-600      (#DC2626)
  to-orange-600     (#EA580C)
  opacity: /10

Accessories:
  from-indigo-600   (#4F46E5)
  to-purple-600     (#9333EA)
  opacity: /10
```

### Glass & Overlay Colors
```
Glassmorphic overlay:
  background: rgba(255, 255, 255, 0.1)
  backdrop-filter: blur(10px)
  border: 1px solid rgba(255, 255, 255, 0.2)

Dark overlay (readability):
  background: linear-gradient(
    to top,
    rgba(15, 23, 42, 0.8),    /* from-slate-950/80 */
    rgba(15, 23, 42, 0.4)     /* via-slate-950/40 */
  )

Border glow (hover):
  border: 2px solid rgba(255, 255, 255, 0.4)

Icon background:
  background: rgba(255, 255, 255, 0.1)
  border: 1px solid rgba(255, 255, 255, 0.2)
```

---

## 📐 TYPOGRAPHY HIERARCHY

### Desktop
```
Category Name:
  Font size:   24px (md), 28px (lg), 36px (2xl)
  Font weight: 900 (black)
  Line height: 1.0
  Color:       white
  Shadow:      drop-shadow-lg

Tagline:
  Font size:   14px (sm), 16px (base)
  Font weight: 400 (normal)
  Line height: 1.4
  Color:       rgba(255, 255, 255, 0.9)
  Shadow:      drop-shadow-md

Featured Card (2x2):
  Category name: 36px (sm), 48px (lg)
  Tagline:       16px (base), 18px (lg)

CTA Text:
  Font size:   14px (sm), 16px (base)
  Font weight: 600 (semibold)
  Color:       white
  Family:      system font stack
```

### Mobile
```
Category Name:
  Font size:   20px (sm)
  Font weight: 900 (black)
  Line height: 1.0

Tagline:
  Font size:   13px (xs)
  Font weight: 400
  Line height: 1.4

CTA Text:
  Font size:   13px (sm)
  Font weight: 600
```

---

## 🔲 SPACING & SIZING

### Card Dimensions
```
Desktop:
  Default card:    w-full, h-64 (256px)
  Featured card:   col-span-2, row-span-2, h-96 (384px)
  Gap:             gap-4 (md), gap-6 (lg)

Tablet:
  All cards:       w-full, h-64 (256px)
  Featured card:   col-span-2, row-span-2
  Gap:             gap-4

Mobile:
  Card width:      w-56 (224px sm), w-64 (256px)
  Card height:     h-64 (256px)
  Gap:             gap-4
  Scroll padding:  px-4
```

### Internal Padding
```
Card padding:
  Desktop:  p-6 (24px)
  Mobile:   p-4 (16px)
  sm:       p-4 (16px)

Icon padding:
  Desktop:  p-4 (16px)
  Mobile:   p-3 (12px)

Badge padding:
  Horizontal:  px-3 (12px)
  Vertical:    py-1 (4px)
```

### Section Spacing
```
Section:
  Vertical:   py-12 (96px), sm:py-16, lg:py-20
  Horizontal: px-4 (16px), sm:px-6, lg:px-8

Header:
  Bottom margin:  mb-12 (48px)
  Text gap:       gap-4 between title & subtitle

Footer:
  Top margin:     mt-12 (48px)
```

### Border Radius
```
Cards:          rounded-3xl (24px)
Icons:          rounded-2xl (16px)
Badges:         rounded-full (9999px)
Buttons:        rounded-2xl (16px)
```

---

## ✨ SHADOW HIERARCHY

### Default State
```
Box shadow:  0 1px 2px 0 rgba(0,0,0,0.05)
            (subtle, barely visible)
```

### Hover State (Desktop)
```
Box shadow:  0 20px 25px -5px rgba(0,0,0,0.1),
             0 10px 10px -5px rgba(0,0,0,0.04)
            (larger, more prominent)
```

### Icon Container
```
Box shadow:  0 1px 2px 0 rgba(0,0,0,0.05)
            (subtle, same as default)
```

### CTA Button
```
Default:     0 1px 3px 0 rgba(0,0,0,0.1)
Hover:       0 10px 15px -3px rgba(0,0,0,0.2)
```

---

## 🎬 ANIMATION TIMINGS

### Staggered Entrance
```
First card:   0ms    (delay: 0ms, duration: 500ms)
Second card:  50ms   (delay: 50ms, duration: 500ms)
Third card:   100ms  (delay: 100ms, duration: 500ms)
...
Pattern:      delay = index * 50ms
Total time for 8 cards: ~350ms + 500ms = 850ms
```

### Hover Animations (Desktop)
```
Card lift:           200ms (instant/25ms)
Image scale:         500ms (starts immediately)
Icon lift:           300ms
Title slide:         300ms
Tagline slide:       300ms
CTA fade-in:         300ms (easing: ease-out)
Glass overlay fade:  300ms
Border glow fade:    300ms

All start together at hover
```

### Mobile Swipe Hint
```
Arrow animation:     2000ms
Pattern:             x: [0, 8, 0]
Infinite:            repeat: Infinity
Easing:              default ease
```

### Entrance Easing
```
Framer Motion default:  easeInOut
staggerChildren:        0.05
Custom:                 null (uses defaults)
```

---

## 🏷️ BADGE STYLES

### Trending Badge (🔥)
```
Background:  bg-red-500/90 (semi-transparent)
Backdrop:    backdrop-blur
Text:        white, text-xs, font-bold
Border:      border border-red-400/50
Padding:     px-3 py-1
Border-radius: rounded-full
Animation:   scale 0 → 1 (on view)
Content:     "🔥 Trending"
```

### New Badge (✨)
```
Background:  bg-blue-500/90
Backdrop:    backdrop-blur
Text:        white, text-xs, font-bold
Border:      border border-blue-400/50
Padding:     px-3 py-1
Border-radius: rounded-full
Animation:   scale 0 → 1 (on view)
Content:     "✨ New"
```

### Featured Badge (⭐)
```
Background:  bg-amber-500/90
Backdrop:    backdrop-blur
Text:        white, text-xs, font-bold
Border:      border border-amber-400/50
Padding:     px-3 py-1
Border-radius: rounded-full
Animation:   scale 0 → 1 (on view)
Content:     "⭐ Featured"
Visible:     Large cards only (featured: true)
```

---

## 🔮 GLASSMORPHISM DETAILS

### Layer Composition
```
1. Image layer
   └─ object-cover
   └─ scale on hover

2. Color gradient overlay
   └─ category-specific color
   └─ opacity: /10
   └─ opacity changes on hover

3. Dark overlay
   └─ linear gradient (top to bottom)
   └─ from-slate-950/80 to transparent
   └─ opacity: 70% → 60% on hover

4. Glassmorphic layer (appears on hover)
   ├─ bg-white/10
   ├─ backdrop-blur-md (12px blur)
   ├─ border: 1px white/20
   ├─ rounded-3xl
   └─ opacity: 0 → 1 on hover (300ms)

5. Border glow (appears on hover)
   ├─ border: 2px white/40
   ├─ rounded-3xl
   └─ opacity: 0 → 1 on hover (300ms)
```

### Visual Effect
- Frosted glass appearance
- Semi-transparent overlays
- Slight blur effect
- White glowing border
- Premium, luxury feel

---

## 📱 MOBILE SPECIFIC

### Touch States
```
Default:     Normal card
Tap:         Scale: 1.0 → 0.98 (100ms)
Release:     Navigate to category
Feedback:    Visual press effect only (no hover)
```

### Scroll Snap
```
Container:   scroll-snap-type: x mandatory
Cards:       scroll-snap-align: center
Behavior:    smooth (scroll-behavior: smooth)
Direction:   Horizontal (overflow-x-auto)
Padding:     px-4 (-mx-4 for full width)
```

### Swipe Hint
```
Text:        "Swipe for more →"
Color:       text-slate-500
Size:        text-sm
Layout:      flex, items-center, justify-center
Arrow:       Animated right arrow (8px bounce)
Animation:   2s infinite loop
Show:        Mobile only (md:hidden)
```

---

## 🌈 VISUAL CONSISTENCY

### Icon Styling
```
Size:        w-12 h-12 (48px)
Mobile:      Same size
Color:       Inherited from category color
Background:  white/10 with backdrop blur
Border:      white/20
Padding:     p-3 (12px) or p-4 (16px)
Animation:   Lift on card hover
```

### Text Styling
```
Weight consistency:
  Headlines:  900 (black)
  Body:       400 (normal)
  CTA:        600 (semibold)

Color consistency:
  Primary:    white (for contrast)
  Secondary:  white/90 (slightly faded)
  Tertiary:   white/70 (more faded)

Shadow consistency:
  Headlines:  drop-shadow-lg
  Body:       drop-shadow-md
  Purpose:    Readability over image
```

---

## 🎯 VISUAL HIERARCHY

### Element Importance (Desktop)
```
1. Featured card (largest)
   └─ 2x2 size, center attention

2. Category name
   └─ Largest text, bold

3. Background image
   └─ Visual interest

4. Tagline
   └─ Smaller text, secondary

5. Icon
   └─ Floating, semi-transparent

6. CTA (hover only)
   └─ Appears on interaction

7. Badge
   └─ Top-right, secondary attention
```

### Element Importance (Mobile)
```
1. Category name
2. Background image
3. Tagline
4. Icon
5. Badge (if present)
(CTA not visible due to space)
```

---

## 🚀 RESPONSIVE REFINEMENTS

### Tablet to Desktop Transition
```
Grid cols:    2 → 4 (md → lg)
Gap:          gap-4 → gap-6
Font:         Slight increase
Featured:     Still 2x2
```

### Mobile to Tablet Transition
```
Layout:       Scroll → Grid
Display:      Horizontal → 2D grid
Touch:        Tap → Hover-enabled
Hint:         Visible → Hidden
```

---

## 📋 IMPLEMENTATION CHECKLIST

- ✅ All gradients applied
- ✅ Shadow hierarchy correct
- ✅ Typography sizes matched
- ✅ Spacing consistent
- ✅ Border radius unified
- ✅ Colors verified
- ✅ Animations smooth
- ✅ Mobile responsive
- ✅ Accessibility met
- ✅ Performance optimized

---

**Style Guide Version**: 1.0.0
**Last Updated**: July 26, 2026
**Status**: Complete & Production Ready
