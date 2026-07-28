# Mystery Box Page - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    NexStore Platform                             │
└─────────────────────────────────────────────────────────────────┘

                           ┌──────────────────┐
                           │   Admin User     │
                           │   Dashboard      │
                           └────────┬─────────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │  Admin Mystery Box            │
                    │  /admin/mystery-box           │
                    │  - Create boxes               │
                    │  - Edit/Delete boxes          │
                    │  - Upload images              │
                    │  - Set probabilities          │
                    │  - Schedule deals             │
                    └───────────────┬────────────────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │   API Layer                    │
                    │ /api/admin/mystery-box         │
                    │ GET  - Fetch all boxes         │
                    │ POST - Create box              │
                    │ PUT  - Update box              │
                    │ DELETE - Delete box            │
                    └───────────────┬────────────────┘
                                    │
                  ┌─────────────────▼─────────────────┐
                  │    Database (Prisma)              │
                  │ - MysteryBox table                │
                  │ - Reward items                    │
                  │ - Product relationships           │
                  └───────────────┬─────────────────┘
                                  │
                                  │ (Data flows back)
                                  │
                    ┌─────────────▼──────────────┐
                    │  Mobile Client Page         │
                    │  /m/mystery-box             │
                    │                             │
                    │  Entry: page.tsx (Server)   │
                    │  Logic: MysteryBoxPageClientNew
                    └─────────┬──────────────────┘
                              │
                              │ (Renders components)
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────┐         ┌──────────┐         ┌──────────┐
   │ Header  │         │   Hero   │         │Categories│
   │Component│         │ Section  │         │  Cards   │
   └────┬────┘         └────┬─────┘         └────┬─────┘
        │                   │                     │
        │            ┌──────▼─────┐              │
        │            │  Animation  │              │
        │            │  Variants   │              │
        │            └──────┬─────┘              │
        │                   │                     │
        │  ┌────────────────┼────────────────┐   │
        │  │                │                │   │
        ▼  ▼                ▼                ▼   ▼
   ┌─────────────────────────────────────────────┐
   │     Component Library Layer                 │
   │                                             │
   │  ✓ PremiumBoxCard                          │
   │  ✓ FlashDealsSection                       │
   │  ✓ MysteryRevealSection                    │
   │  ✓ CustomerReviewsSection                  │
   │  ✓ TrustSection                            │
   │                                             │
   │  Hooks:                                     │
   │  ✓ useResponsive()                         │
   │  ✓ useInView()                             │
   │                                             │
   │  Animations:                                │
   │  ✓ 10+ animation variants                  │
   │  ✓ Framer Motion integration               │
   └─────────┬──────────────────────────────────┘
             │
             │ (Renders UI)
             │
        ┌────▼────────────────────────────────┐
        │     Mobile Viewport (390px)          │
        │                                      │
        │  ┌──────────────────────────────┐  │
        │  │ [Back] | Header | [🔍][🛒]  │  │
        │  ├──────────────────────────────┤  │
        │  │   🎁 Full-width Hero Banner   │  │
        │  ├──────────────────────────────┤  │
        │  │ [Beauty] [Gaming] [Tech]      │  │
        │  │ [Home]   [Morocco] [Edition] │  │
        │  ├──────────────────────────────┤  │
        │  │ ⚡ Flash Deal - 2:35 left     │  │
        │  ├──────────────────────────────┤  │
        │  │ Premium Mystery Boxes         │  │
        │  │ ┌──────────────────────────┐ │  │
        │  │ │ 🎁 Gold Box - 9990 MAD   │ │  │
        │  │ │ ★★★★★ (342 reviews)     │ │  │
        │  │ │ [View Items] [Add Cart]  │ │  │
        │  │ └──────────────────────────┘ │  │
        │  ├──────────────────────────────┤  │
        │  │ Your Box May Contain         │  │
        │  │ [🎁] [🎁] [🎁]             │  │
        │  │ (Tap to reveal items)        │  │
        │  ├──────────────────────────────┤  │
        │  │ ⭐ Customer Reviews          │  │
        │  │ 👩 Fatima K. - ★★★★★       │  │
        │  │ "Amazing quality!"           │  │
        │  ├──────────────────────────────┤  │
        │  │ Why Trust NexStore           │  │
        │  │ ✓ Secure | ✓ Fast           │  │
        │  │ ✓ Returns | ✓ Verified      │  │
        │  ├──────────────────────────────┤  │
        │  │ [Get Your Box Today →]       │  │
        │  └──────────────────────────────┘  │
        │  [🏠] [❤️] [👤] [🛍️] [⚙️]         │
        └────────────────────────────────────┘
             │
             │ User Interaction
             │
      ┌──────┴────────┬──────────┬──────────┐
      │               │          │          │
      ▼               ▼          ▼          ▼
   [Add Cart]    [Navigate]  [View Items] [Scroll]
      │               │          │          │
      │ ┌─────────────┘          │          │
      │ │                        │          │
      ▼ ▼                        │          │
   ┌────────────┐                │          │
   │ Zustand    │                │          │
   │ Cart Store │◄───────────────┤          │
   │            │          (Reveal product  │
   │ items: []  │           details)        │
   │ count: 1   │                          │
   └─────┬──────┘                          │
         │                                 │
         │        (Badge updates)          │
         │                                 │
         ▼                                 ▼
   ┌──────────────┐            ┌──────────────────┐
   │ Cart Icon    │            │ Animation System │
   │ Badge: "1"   │            │ (Framer Motion)  │
   └──────────────┘            │                  │
                               │ - Scroll reveals │
                               │ - Hover effects  │
                               │ - Tap feedback   │
                               │ - Staggered in   │
                               └──────────────────┘
```

---

## Data Flow Diagram

### Creation Flow
```
Admin Dashboard
     │
     │ Admin creates/edits box
     │
     ▼
┌─────────────────────────────┐
│ Box Configuration:          │
│ - name: "Gold Box"          │
│ - tier: "gold"              │
│ - price: 9990               │
│ - stock: 50                 │
│ - rewards: [product_id...]  │
│ - images: [urls...]         │
└────────────┬────────────────┘
             │
             │ POST /api/admin/mystery-box
             │
             ▼
      ┌──────────────┐
      │   API Endpoint
      │   /api/admin/
      │   mystery-box
      └──────┬───────┘
             │
             │ Validates & saves
             │
             ▼
      ┌──────────────┐
      │  Database    │
      │  (Prisma)    │
      │              │
      │  MysteryBox  │
      │  ├─ id       │
      │  ├─ name     │
      │  ├─ price    │
      │  ├─ tier     │
      │  ├─ stock    │
      │  └─ rewards[]│
      └──────┬───────┘
             │
             │ (On refresh)
             │ GET /api/admin/mystery-box
             │
             ▼
      ┌────────────────┐
      │ Mobile Page    │
      │ /m/mystery-box │
      │                │
      │ Fetches data   │
      │ Renders UI     │
      │ Updates display│
      └────────────────┘
```

### User Interaction Flow
```
User on Mobile
     │
     │ Scrolls to box
     │
     ▼
┌────────────────────┐
│ PremiumBoxCard     │
│ Renders with:      │
│ - Tier colors      │
│ - Stock info       │
│ - Rating/reviews   │
└────────┬───────────┘
         │
         │ User clicks [Add to Cart]
         │
         ▼
┌────────────────────────────┐
│ onClick Handler            │
│ 1. Create product stub     │
│ 2. Call addItem()          │
│ 3. Update Zustand store    │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────┐
│ Zustand Store      │
│ cart.items.push()  │
│ cartCount++        │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ UI Re-render       │
│ Cart badge updates │
│ [🛒 1]             │
└────────────────────┘
         │
         │ User clicks cart icon
         │
         ▼
    /m/cart
```

---

## Component Hierarchy

```
MysteryBoxPageClientNew
│
├── MobileLayout
│   │
│   ├── MysteryBoxHeader
│   │   ├── Back button (link to /m)
│   │   ├── Title & subtitle (static)
│   │   ├── Search icon (clickable)
│   │   └── Cart icon with badge (from Zustand)
│   │
│   ├── HeroSection
│   │   ├── Animated banner
│   │   ├── Gift emoji (floating)
│   │   ├── Title
│   │   ├── Subtitle
│   │   ├── Value badges
│   │   ├── CTA button
│   │   └── Scroll indicator
│   │
│   ├── CategoryCards
│   │   ├── Card (Beauty)
│   │   ├── Card (Gaming)
│   │   ├── Card (Tech)
│   │   ├── Card (Home)
│   │   ├── Card (Morocco)
│   │   └── Card (Limited)
│   │
│   ├── FlashDealsSection
│   │   ├── Deal card 1 (with countdown)
│   │   ├── Deal card 2 (with countdown)
│   │   └── Deal card 3 (with countdown)
│   │
│   ├── Featured Mystery Boxes section
│   │   ├── PremiumBoxCard (Box 1)
│   │   │   ├── Gradient header
│   │   │   ├── Value label
│   │   │   ├── Price
│   │   │   ├── Rating
│   │   │   ├── View button
│   │   │   └── Add to cart button
│   │   ├── PremiumBoxCard (Box 2)
│   │   └── PremiumBoxCard (Box N)
│   │
│   ├── MysteryRevealSection
│   │   ├── Reveal card 1 (flip animation)
│   │   ├── Reveal card 2 (flip animation)
│   │   ├── Reveal card 3 (flip animation)
│   │   ├── Reveal card 4 (flip animation)
│   │   ├── Reveal card 5 (flip animation)
│   │   ├── Reveal card 6 (flip animation)
│   │   └── Pro tips info box
│   │
│   ├── CustomerReviewsSection
│   │   ├── Review card 1
│   │   ├── Review card 2
│   │   ├── Review card 3
│   │   └── See all button
│   │
│   ├── TrustSection
│   │   ├── Trust badge 1 (secure)
│   │   ├── Trust badge 2 (fast)
│   │   ├── Trust badge 3 (returns)
│   │   ├── Trust badge 4 (verified)
│   │   └── Brand info
│   │
│   ├── Bottom CTA section
│   │   ├── Heading
│   │   └── Shop Now button
│   │
│   └── MobileNav (bottom navigation)
│       ├── Home icon
│       ├── Explore icon
│       ├── Likes icon
│       ├── Account icon
│       └── Settings icon
```

---

## State Management

```
Zustand Cart Store (useCartStore)
│
├── items[]
│   ├── {
│   │   id: string
│   │   name: string
│   │   price: number
│   │   quantity: number
│   │   image: string
│   │   ...
│   │ }
│   └── {...}
│
├── addItem(product, quantity)
├── removeItem(id)
├── updateQuantity(id, quantity)
├── clearCart()
│
└── Persisted to localStorage
    (restored on page reload)
```

---

## Animation System

```
AnimationVariants.ts
│
├── fadeInUpVariants
│   │ opacity: 0 → 1
│   │ y: 20px → 0px
│   └── duration: 0.4s
│
├── fadeInScaleVariants
│   │ opacity: 0 → 1
│   │ scale: 0.9 → 1
│   └── spring physics
│
├── staggerContainerVariants
│   │ Delays children
│   │ staggerChildren: 0.1s
│   └── delayChildren: 0.1s
│
├── hoverLiftVariants
│   │ Lifts on hover
│   │ y: 0px → -8px
│   └── duration: 0.2s
│
├── pulseVariants
│   │ Opacity pulse
│   │ scale pulse
│   └── Infinite loop
│
├── rotateVariants
│   │ Continuous rotation
│   │ rotate: 0° → 360°
│   └── duration: 20s
│
├── floatingVariants
│   │ Up/down animation
│   │ y: [0, -10, 0]
│   └── duration: 3s
│
└── Combined in components:
    motion.div with variants={}
    whileInView={{}}
    whileHover={{}}
    whileTap={{}}
    transition={{}}
```

---

## Mobile Viewport Optimization

```
MobileLayout
├── mx-auto              ← Center container
├── w-full               ← Full width
├── max-w-sm             ← 384px max (24rem)
│
└── Content sections:
    ├── px-4             ← 16px horizontal padding
    ├── py-6             ← 24px vertical padding
    ├── gap-3            ← 12px item spacing
    ├── grid-cols-2      ← 2-column grid
    ├── rounded-2xl      ← 16px rounded
    │
    └── Responsive for:
        375px (min)
        390px (target) ← PRIMARY
        430px (max)
        
        All maintain:
        ✓ No horizontal scroll
        ✓ Readable text (14px+)
        ✓ Tappable buttons (44px+)
        ✓ Proper spacing
        ✓ Aligned images
```

---

## Performance Optimization Chain

```
User Request
│
├─ Next.js App Router
│  └─ Code splitting
│
├─ page.tsx (Server)
│  ├─ Fetch data from API
│  └─ Pass to client component
│
├─ MysteryBoxPageClientNew (Client)
│  ├─ Lazy load images
│  ├─ Framer Motion optimized
│  └─ Zustand store (no re-render cycles)
│
├─ Components rendered
│  ├─ GPU-accelerated animations
│  ├─ Viewport-triggered (not frame-based)
│  └─ Minimal repaints
│
├─ User interactions
│  ├─ Touch targets respond < 100ms
│  ├─ State updates via Zustand
│  └─ Re-renders only affected parts
│
└─ Result:
   ✓ FCP < 1.5s
   ✓ LCP < 2.5s
   ✓ CLS < 0.1
   ✓ 60fps animations
   ✓ Smooth scrolling
```

---

## Admin Integration Points

```
Admin Actions              → API Endpoint           → Database        → Mobile Display
─────────────────────────────────────────────────────────────────────────────────
Create mystery box     →  POST /api/admin/box     →  MysteryBox     →  New card
                                                    │
Change tier/colors     →  PUT /api/admin/box/:id  →  UPDATE tier    →  Colors update
                                                    │
Update price           →  PUT /api/admin/box/:id  →  UPDATE price   →  Price displays
                                                    │
Add/remove items       →  PUT /api/admin/box/:id  →  Rewards[]      →  Reveal section
                                                    │
Upload images          →  PUT /api/admin/box/:id  →  UPDATE image   →  Images load
                                                    │
Toggle active          →  PUT /api/admin/box/:id  →  UPDATE active  →  Show/hide box
                                                    │
Set flash deal         →  PUT /api/admin/box/:id  →  Deal fields    →  Countdown
                                                    │
Mobile refresh         ←  GET /api/admin/box      ←  Query DB        ←  Fetch fresh data
```

---

**Last Updated:** July 26, 2024  
**Version:** 1.0  
**Status:** Complete
