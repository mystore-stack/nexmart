# ⭐ Editor's Choice - Premium Section Implementation

## Overview

A fully-featured, production-ready premium marketplace section inspired by Apple, Nike, and modern e-commerce platforms. This replaces the original 3 promotional cards with a luxury Editor's Choice section that showcases hand-picked products curated by the NexMart team.

---

## ✨ Features

### Frontend (Homepage)

**Premium Layout:**
- **Left Side:** Large promotional banner with luxury lifestyle imagery
  - Soft radial gradient background (white → gold tones)
  - Premium badge "Editor's Pick"
  - Custom title, subtitle, and description
  - "Shop Collection" CTA button
  - Decorative elements with blur effects
  
- **Right Side:** 6 premium product cards in responsive grid
  - Large product images (studio-quality)
  - Product name, brand, rating (stars + count)
  - Current price + old price with discount badge
  - Custom badges (configurable per product)
  - Wishlist button with toggle
  - Quick "Add to Cart" button
  - Smooth hover animations (Framer Motion)

**Responsive Design:**
- Mobile: 1 column
- Tablet (sm): 2 columns
- Desktop (xl): 3 columns for products
- Premium banner: 1.05fr vs 1.4fr grid ratio

**Dynamic Behavior:**
- Fetches products from `/api/homepage/sections/promotionalCards/products`
- Respects section visibility (`active` flag)
- Auto-hides if empty (`hideIfEmpty` setting)
- Loading skeleton states
- Empty state with helpful message

---

### Admin Dashboard

**Location:** `/admin/cms/editors-choice`

**Section Settings:**
- ✅ Show/Hide section toggle
- ✅ Edit title (default: "Editor's Choice")
- ✅ Edit subtitle (default: "Hand-picked products selected by the NexMart team.")
- ✅ Edit description (luxury marketplace copy)
- ✅ Upload banner image (with URL input fallback)
- ✅ Customize "View All" button text
- ✅ Set destination URL (default: `/collections/editors-choice`)
- ✅ Set maximum products (default: 6)
- ✅ Hide if empty toggle

**Product Management:**
- ✅ Search products by name, SKU
- ✅ Filter by category, brand, published status
- ✅ Multi-select products (with max limit enforcement)
- ✅ Drag & drop to reorder products
- ✅ Set custom price per product
- ✅ Add custom badge per product (e.g., "Limited Edition", "Exclusive")
- ✅ Set active/inactive status per product
- ✅ Date range scheduling (startDate, endDate)
- ✅ Remove products from selection

**Real-Time Preview:**
- Figma-quality preview of homepage section
- Shows banner with current settings
- Displays product cards with custom prices/badges
- Updates instantly as you make changes
- Preview section respects maxProducts setting

**Admin Controls:**
- Save changes button with loading state
- Open Collection button (opens `/collections/editors-choice` in new tab)
- Preview Homepage button (opens `/` in new tab)
- Back to CMS button

---

### Collection Page

**Location:** `/collections/editors-choice`

**Hero Section:**
- Premium gradient background (white → sand tones)
- "Editor's Pick" badge
- Dynamic title and subtitle from admin settings
- Long-form description
- Promotional banner image (large, full-width on mobile, 50% on desktop)
- "Back Home" and "Browse Selection" CTAs

**Product Grid:**
- Full collection display (all selected products)
- Same premium card design as homepage
- Responsive: 1 → 2 → 4 columns
- Wishlist functionality
- Quick add to cart
- Loading states
- Empty state: "Editor's Choice is being curated"

---

## 🎨 Design System Integration

**Colors:**
- Emerald: `#0F766E` (brand primary)
- Gold: `#D4AF37` (premium accents)
- White/Sand gradients for luxury feel
- Amber badges for "Editor's Pick"

**Typography:**
- Display font: Cormorant Garamond (headings)
- Body font: DM Sans (content)
- Uppercase tracking for badges: `0.22em`

**Shadows & Effects:**
- Luxury shadow: `0 20px 60px rgba(15,23,42,0.08)`
- Hover shadow: `0 22px 60px rgba(15,23,42,0.12)`
- Glass card: backdrop blur with soft borders
- Smooth animations: 300-500ms transitions

**Border Radius:**
- Sections: `2rem` (32px)
- Cards: `1.75rem` (28px)
- Buttons: `0.875rem` (14px) to `2xl`
- Images: `1.35rem` (21.6px)

---

## 🗄️ Database Schema

**Model: `HomepageSectionProduct`**

```prisma
model HomepageSectionProduct {
  id          String   @id @default(uuid()) @db.Uuid
  sectionId   String   @db.Uuid
  productId   String   @db.Uuid
  order       Int      @default(0)           // Display order
  customPrice Float?                         // Override product price
  customBadge String?                        // Custom badge text
  active      Boolean  @default(true)        // Visibility toggle
  startDate   DateTime?                      // Schedule start
  endDate     DateTime?                      // Schedule end
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  section     HomePageSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  product     Product         @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([sectionId, productId])
  @@index([sectionId])
  @@index([productId])
  @@index([order])
  @@index([active])
}
```

**Model: `HomePageSection`**

```prisma
model HomePageSection {
  id             String   @id @default(uuid()) @db.Uuid
  sectionKey     String   @unique              // "promotionalCards"
  title          String                        // "Editor's Choice"
  subtitle       String?                       // Tagline
  description    String?                       // Long description
  bannerImage    String?                       // Hero image URL
  viewAllButton  String?                       // CTA text
  destinationUrl String?                       // Collection URL
  order          Int      @default(0)          // Homepage order
  displayOrder   Int      @default(0)          // Display sequence
  active         Boolean  @default(true)       // Show/hide
  maxProducts    Int      @default(12)         // Limit
  hideIfEmpty    Boolean  @default(false)      // Auto-hide
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  products       HomepageSectionProduct[]
}
```

---

## 🔌 API Routes

### Public Routes

**GET `/api/homepage/sections/[sectionKey]/products`**
- Fetches products for a section (e.g., `promotionalCards`)
- Returns: `{ success: true, data: Product[], section: SectionData }`
- Filters by `active` status and date range
- Sorts by `order` ascending
- Public access (no auth required)

### Admin Routes

**GET `/api/admin/cms/homepage-sections`**
- Lists all homepage sections
- Auto-initializes defaults if empty
- Requires admin authentication

**POST `/api/admin/cms/homepage-sections`**
- Creates or updates a section
- Upserts by `sectionKey`
- Validates with Zod schema

**PATCH `/api/admin/cms/homepage-sections`**
- Updates section settings (title, subtitle, etc.)
- Requires `id` in request body

**DELETE `/api/admin/cms/homepage-sections?id=<uuid>`**
- Deletes a section
- Cascade deletes related products

**PUT `/api/admin/cms/homepage-sections`**
- Reorders sections
- Accepts `{ items: [{ id, order }] }`

**GET `/api/admin/cms/homepage-sections/[sectionKey]/products`**
- Lists products in a section
- Includes full product details and category
- Admin only

**POST `/api/admin/cms/homepage-sections/[sectionKey]/products`**
- Adds product to section
- Enforces `maxProducts` limit
- Validates product exists
- Prevents duplicates (reactivates if exists)

**PATCH `/api/admin/cms/homepage-sections/[sectionKey]/products`**
- Updates product settings (order, customPrice, customBadge, etc.)
- Supports bulk reorder: `{ items: [{ id, order }] }`

**DELETE `/api/admin/cms/homepage-sections/[sectionKey]/products?id=<uuid>`**
- Removes product from section

---

## 📦 File Structure

```
src/
├── lib/
│   └── editors-choice.ts              # Utilities, defaults, types
├── components/
│   ├── home/
│   │   └── PromotionalCardsSection.tsx  # Homepage section
│   └── admin/
│       └── ProductSelector.tsx          # Product search/select UI
├── app/
│   ├── page.tsx                       # Homepage (includes section)
│   ├── collections/
│   │   └── editors-choice/
│   │       └── page.tsx               # Collection page
│   └── admin/
│       └── cms/
│           └── editors-choice/
│               └── page.tsx           # Admin dashboard
└── api/
    ├── homepage/
    │   └── sections/
    │       └── [sectionKey]/
    │           └── products/
    │               └── route.ts       # Public API
    └── admin/
        └── cms/
            └── homepage-sections/
                ├── route.ts           # Section CRUD
                └── [sectionKey]/
                    └── products/
                        └── route.ts   # Product management
```

---

## 🎯 Key Components

### `src/lib/editors-choice.ts`

**Exports:**
- `EDITORS_CHOICE_SECTION_KEY` = `"promotionalCards"`
- `EDITORS_CHOICE_COLLECTION_URL` = `"/collections/editors-choice"`
- `EDITORS_CHOICE_DEFAULTS` (title, subtitle, images, maxProducts, etc.)
- `EDITORS_CHOICE_PRODUCT_ART` (6 premium product placeholder images)
- Interfaces: `EditorsChoiceProduct`, `EditorsChoiceSectionData`, `EditorsChoiceProductArt`, `EditorsChoiceDefaults`, `EditorsChoiceSectionCopy`
- Type guards: `isEditorsChoiceProduct()`, `isEditorsChoiceSectionData()`

**Utility Functions:**
- `deriveBrandLabel(product)` - Extracts brand from tags or category
- `calculateDiscount(product)` - Computes % discount from comparePrice
- `getEditorsChoiceImage(product, index)` - Returns product image or AI-generated fallback
- `getEditorsChoiceSectionCopy(section)` - Merges section data with defaults
- `buildImageUrl(prompt, size)` - Generates AI image URLs

---

## 🚀 How to Use

### For Admins

1. **Navigate to Admin Dashboard:**
   - Go to `/admin/cms/editors-choice`
   - Or click "Editor's Choice" in CMS menu

2. **Configure Section:**
   - Toggle "Show/Hide" to control visibility
   - Edit title, subtitle, description
   - Upload a premium banner image
   - Set max products (default: 6)

3. **Select Products:**
   - Search by name or SKU
   - Filter by category/brand
   - Click "+" to add products
   - Drag to reorder
   - Set custom price or badge per product

4. **Preview & Save:**
   - Check the real-time preview
   - Click "Save Changes"
   - Visit homepage to see live

5. **View Collection:**
   - Click "Open Collection" to see full page
   - Share `/collections/editors-choice` with customers

### For Developers

**Add Editor's Choice to Homepage:**
```tsx
import { PromotionalCardsSection } from "@/components/home/PromotionalCardsSection";

// In page.tsx
<PromotionalCardsSection />
```

**Fetch Products Programmatically:**
```typescript
const response = await fetch('/api/homepage/sections/promotionalCards/products');
const { success, data, section } = await response.json();
```

**Use Utility Functions:**
```typescript
import { 
  deriveBrandLabel, 
  calculateDiscount,
  getEditorsChoiceImage 
} from '@/lib/editors-choice';

const brand = deriveBrandLabel(product);
const discount = calculateDiscount(product);
const image = getEditorsChoiceImage(product, 0);
```

---

## 🎨 Generated Images

**Banner Image:**
- Prompt: "luxury shopping scene featuring premium electronics on elegant white and soft gold styling, minimal background, soft shadows, refined studio lighting, high-end marketplace editorial banner, ultra realistic product photography"
- Size: Landscape 16:9
- Style: White/gold theme, high-end marketplace

**Product Images (6):**
1. **Smartphone** - Premium flagship phone, polished aluminum
2. **Laptop** - Thin metallic ultrabook, clean aesthetic
3. **Smart Watch** - Minimal luxury smartwatch, crisp display
4. **Wireless Earbuds** - Elegant charging case, premium design
5. **Gaming Headset** - Modern matte finish, high-end styling
6. **Mechanical Keyboard** - Refined keycaps, luxury layout

All images are studio-quality with:
- White seamless background
- Soft shadows
- Centered composition
- Ultra-detailed rendering
- E-commerce ready

---

## ✅ Production Checklist

- [✅] Database schema with relations and indexes
- [✅] Public API endpoint for fetching products
- [✅] Admin API endpoints (CRUD + reordering)
- [✅] Homepage section component with animations
- [✅] Collection page with full product grid
- [✅] Admin dashboard with product selector
- [✅] Real-time preview in admin
- [✅] TypeScript interfaces and type guards
- [✅] Image upload functionality
- [✅] Custom price and badge support
- [✅] Date range scheduling
- [✅] Drag & drop reordering
- [✅] Empty states and loading skeletons
- [✅] Responsive design (mobile → desktop)
- [✅] Wishlist integration
- [✅] Cart integration
- [✅] Error handling and validation
- [✅] Authentication checks
- [✅] Luxury design system consistency

---

## 🔐 Security

- ✅ Admin routes protected with `requireAdmin()` middleware
- ✅ Zod schema validation on all inputs
- ✅ SQL injection prevention via Prisma ORM
- ✅ Cascade delete to prevent orphaned records
- ✅ Unique constraints on junction table
- ✅ UUID-based IDs for security
- ✅ Input sanitization in forms

---

## 🎯 Performance

- ✅ Database indexes on frequently queried fields
- ✅ Next.js Image optimization with `sizes` attribute
- ✅ Lazy loading with Suspense boundaries
- ✅ Efficient queries with Prisma `include`
- ✅ Client-side state management (minimal re-renders)
- ✅ Framer Motion animations (GPU-accelerated)
- ✅ Optimistic UI updates

---

## 🌐 Internationalization Ready

The component supports dynamic text through admin settings:
- Title, subtitle, description are fully editable
- "View All" button text customizable
- CTA text configurable
- Can easily integrate with i18n library

---

## 📱 Responsive Breakpoints

```
Mobile:   < 640px  (1 column)
Tablet:   640px+   (2 columns)
Desktop:  1024px+  (banner + 3 product columns)
Large:    1280px+  (optimal viewing experience)
```

---

## 🎨 Design Inspiration

**Apple:**
- Clean white backgrounds
- Premium product photography
- Generous whitespace
- Subtle shadows and depth

**Nike:**
- Bold product imagery
- Dynamic grid layouts
- Strong CTAs
- Athletic luxury aesthetic

**Modern E-commerce:**
- Glass morphism effects
- Soft gradients
- Micro-interactions
- Badge system for promotions

---

## 🔄 Future Enhancements

**Potential additions:**
- [ ] A/B testing variants
- [ ] Analytics integration (view tracking, CTR)
- [ ] Personalized recommendations
- [ ] Video support for banner
- [ ] Carousel for more than 6 products
- [ ] Quick view modal
- [ ] Size/variant selector on cards
- [ ] Stock availability indicator
- [ ] Social proof (reviews, purchases)
- [ ] Multi-language support

---

## 🐛 Troubleshooting

**Section not showing on homepage:**
- Check `active` flag in admin dashboard
- Verify at least 1 product is selected
- Check `hideIfEmpty` setting
- Clear browser cache and refresh

**Products not loading:**
- Verify API endpoint returns success
- Check browser console for errors
- Ensure products have `published: true`
- Verify database relations exist

**Images not displaying:**
- Check image URLs are valid
- Verify Next.js Image domains in `next.config.js`
- Use fallback placeholder images
- Check network tab for 403/404 errors

**Admin page not accessible:**
- Verify user has admin role
- Check authentication middleware
- Clear cookies and re-login
- Check API route permissions

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review code comments in components
3. Inspect browser console errors
4. Check database logs
5. Review API responses in Network tab

---

## 🎉 Success!

Your Editor's Choice premium section is now **fully implemented and production-ready**! 

The section seamlessly integrates with your existing NexMart design system while providing a luxury, Apple-inspired shopping experience that elevates your marketplace to the next level.

---

**Built with:**
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- Tailwind CSS
- Framer Motion
- Zod validation
- PostgreSQL

**Deployed on:** NexMart Moroccan Luxury Marketplace 🇲🇦

---

*Last Updated: July 30, 2026*
