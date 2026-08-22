# Homepage CMS Audit

## 1. Homepage Route
- **Location**: `src/app/page.tsx`
- **Data Source**: `getHomePageData()` from `src/lib/home-data.ts`
- **Section Ordering**: `getOrderedHomepageSections()` from `src/lib/homepage/registry.tsx`
- **Revalidation**: 300 seconds (ISR)
- **Rendering**: Uses `renderHomepageSection()` from registry

## 2. Homepage Sections (Canonical)
**Location**: `src/lib/homepage/canonical-contract.ts`

Current canonical sections (16 total):
1. `hero` - Hero banner carousel
2. `categories` - Category navigation
3. `showcaseGrid` - Featured collections grid
4. `flashSale` - Flash sale with countdown
5. `megaPromo` - Large promotional banner
6. `serviceBanners` - Trust indicators
7. `seasonalCollection` - Seasonal products
8. `bundleBuilder` - Interactive bundle builder
9. `recommended` - AI recommendations
10. `brandCarousel` - Brand carousel
11. `featuredProducts` - Featured product grid
12. `trendingProducts` - Trending products
13. `mobileAppBanner` - Mobile app promotion
14. `newsletter` - Newsletter subscription
15. `recentlyViewed` - Recently viewed products
16. `promotionalCards` - Promotional cards
17. `editorsChoice` - Editor's choice (same component as promotionalCards)

## 3. Exact Current Section Order
The order is determined by `displayOrder` field in `HomePageSection` database model.
The registry sorts sections by `displayOrder` ascending.

## 4. Component Used by Each Section
**Location**: `src/lib/homepage/registry.tsx`

- `hero` → `HeroSection`
- `categories` → `CategoriesSection`
- `flashSale` → `FlashSaleSection`
- `megaPromo` → `MegaPromoBannerSection`
- `serviceBanners` → `ServiceBannersSection`
- `showcaseGrid` → `ShowcaseGridSection`
- `seasonalCollection` → `SeasonalCollectionSection`
- `bundleBuilder` → `BundleBuilderSection`
- `recommended` → `RecommendedForYouSection`
- `brandCarousel` → `BrandCarouselSection`
- `featuredProducts` → `FeaturedProducts`
- `trendingProducts` → `TrendingSection`
- `mobileAppBanner` → `MobileAppBannerSection`
- `newsletter` → `NewsletterSection`
- `recentlyViewed` → `RecentlyViewedSection`
- `promotionalCards` → `PromotionalCardsSection`
- `editorsChoice` → `PromotionalCardsSection`

## 5. Product Source for Each Section
**Location**: `src/lib/home-data.ts` and `src/lib/homepage/registry.tsx`

Sections use CMS-assigned products via `HomepageSectionProduct` relation when available, with fallback to:

- `featuredProducts` → `discovery` or `featured` from `getHomePageData()`
- `trendingProducts` → `trending` or `featured` from `getHomePageData()`
- `flashSale` → `flashSale` from `getHomePageData()`
- `seasonalCollection` → `featured` from `getHomePageData()`
- `bundleBuilder` → `featured` from `getHomePageData()`
- `showcaseGrid` → `cms.sponsored, cms.bestsellers, cms.newArrivals, cms.mysteryBoxes`

## 6. Database Models Involved
**Location**: `prisma/schema.prisma`

### HomePageSection
```prisma
model HomePageSection {
  id                  String   @id @default(uuid())
  sectionKey          String   @unique
  title               String
  subtitle            String?
  description         String?
  bannerImage         String?
  viewAllButton       String?
  destinationUrl      String?
  order               Int      @default(0)
  displayOrder        Int      @default(0)
  active              Boolean  @default(true)
  maxProducts         Int      @default(12)
  hideIfEmpty         Boolean  @default(false)
  sectionType         String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  themeSettings       Json?
  // Draft/Published separation fields
  draftActive         Boolean?
  draftDisplayOrder   Int?
  draftThemeSettings  Json?
  publishedAt         DateTime?
  isDraft             Boolean  @default(false)
  products            HomepageSectionProduct[]
}
```

### HomepageSectionProduct
```prisma
model HomepageSectionProduct {
  id          String   @id @default(uuid())
  sectionId   String   @db.Uuid
  productId   String   @db.Uuid
  order       Int      @default(0)
  customPrice Float?
  customBadge String?
  active      Boolean  @default(true)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  product     Product  @relation(fields: [productId], references: [id])
  section     HomePageSection @relation(fields: [sectionId], references: [id])

  @@unique([sectionId, productId])
  @@index([sectionId])
  @@index([productId])
  @@index([order])
  @@index([active])
}
```

### Product
```prisma
model Product {
  id                 String   @id @default(uuid())
  organizationId     String   @db.Uuid
  name               String
  slug               String
  description        String
  price              Float
  comparePrice       Float?
  cost               Float?
  categoryId         String   @db.Uuid
  images             String[]
  tags               String[]
  sku                String
  stock              Int      @default(0)
  lowStockAt         Int      @default(5)
  weight             Float?
  published          Boolean  @default(false)
  featured           Boolean  @default(false)
  isVisible          Boolean  @default(true)
  rating             Float    @default(0)
  reviewCount        Int      @default(0)
  soldCount          Int      @default(0)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  displayOrder       Int      @default(0)
  externalProductId  String?
  externalUrl        String?
  lastSyncedAt       DateTime?
  source             String?
  supplierName       String?
  homepageSections   HomepageSectionProduct[]
  // ... other relations
}
```

## 7. Existing CMS Models
- **HomePageSection** - Main section configuration with draft/published separation
- **HomepageSectionProduct** - Product assignments with ordering and custom settings
- **HomepageConfig** - Global homepage configuration (rarely used)
- **HomeBanner, HeroSlide, PromoBannerItem, etc.** - Legacy section-specific models

## 8. Existing Problems
1. **Over-complex draft/published system** - Has `draftActive`, `draftDisplayOrder`, `draftThemeSettings`, `isDraft` fields that add complexity
2. **Preview functionality** - Has `/admin/cms/homepage/preview` route that needs to be removed per requirements
3. **Inconsistent section keys** - Legacy keys in database may not match canonical keys
4. **Multiple product sources** - Some sections use CMS products, others use hardcoded data sources
5. **Missing product management UI** - No dedicated product manager for assigning products to sections
6. **No bulk product operations** - Cannot bulk assign/remove products from sections

## 9. Files That Should Be Modified
1. `src/app/admin/cms/homepage/page.tsx` - Main CMS page
2. `src/components/admin/cms/homepage/HomepageCmsManager.tsx` - CMS manager component
3. `src/app/api/admin/cms/homepage-sections/route.ts` - API routes
4. `src/app/api/admin/cms/homepage-sections/[sectionKey]/route.ts` - Section-specific API
5. `src/app/api/admin/cms/homepage-sections/[sectionKey]/products/route.ts` - Product assignment API
6. `src/lib/homepage/registry.tsx` - Section registry (may need updates)
7. `prisma/schema.prisma` - May need schema simplification

## 10. Files That MUST NOT Be Modified
1. `src/app/page.tsx` - Customer homepage (DO NOT REDESIGN)
2. `src/components/home/` - All homepage components (DO NOT CHANGE VISUAL DESIGN)
3. `src/lib/home-data.ts` - Data fetching logic (DO NOT CHANGE DATA SOURCES)
4. `src/components/homepage/` - Homepage section components (DO NOT MODIFY VISUALS)
5. `Product` model - DO NOT DELETE OR MODIFY PRODUCT STRUCTURE
6. Any existing product data - DO NOT DELETE PRODUCTS

## 11. Existing Homepage Builder
**Location**: `src/app/admin/cms/homepage-builder/page.tsx`
- **Status**: Currently redirects to `/admin/cms/homepage`
- **Action**: Should remain as redirect, do not repurpose

## 12. Existing Preview System
**Location**: `src/app/admin/cms/homepage/preview/page.tsx`
- **Status**: Has preview functionality
- **Action**: MUST BE REMOVED per requirements

## 13. Current API Endpoints
- `GET/POST /api/admin/cms/homepage-sections` - List/create sections
- `PATCH /api/admin/cms/homepage-sections` - Update sections
- `DELETE /api/admin/cms/homepage-sections` - Delete sections
- `PUT /api/admin/cms/homepage-sections` - Reorder sections
- `GET/PATCH /api/admin/cms/homepage-sections/[sectionKey]` - Section-specific operations
- `GET/POST/DELETE /api/admin/cms/homepage-sections/[sectionKey]/products` - Product assignments

## 14. Current CMS UI Components
- `HomepageCmsManager` - Main CMS manager with tabs and section list
- `SectionEditorDrawer` - Section editing drawer
- `StatusBadge` - Status indicator
- `VisualHomepageCms` - Visual CMS (should be removed)
- `VisualSectionEditor` - Visual section editor (should be removed)

## 15. Section Settings Available
- `active` / `enabled` - Visibility control
- `displayOrder` / `order` - Position control
- `title` - Section title
- `subtitle` - Section subtitle
- `description` - Section description
- `maxProducts` - Product limit
- `hideIfEmpty` - Hide when no products
- `themeSettings` - Custom theme settings
- `destinationUrl` - View all button destination
- `viewAllButton` - View all button text

## 16. Product Assignment System
- Uses `HomepageSectionProduct` junction table
- Supports per-section ordering via `order` field
- Supports custom pricing and badges per assignment
- Supports date-based activation via `startDate`/`endDate`
- Has `active` flag for individual assignments

## 17. Cache/Revalidation
- Homepage uses ISR with 300-second revalidation
- CMS changes call `revalidatePath("/")` and `revalidatePath("/admin/cms/homepage/preview")`
- Cache invalidation is implemented but may need improvement

## 18. Multi-tenancy
- System uses organization-based multi-tenancy
- `HomePageSection` does NOT have `organizationId` (this may be an issue)
- `Product` has `organizationId`
- This needs investigation for proper data isolation

## 19. Security
- CMS routes protected with `requireAdmin()`
- API routes use proper error handling
- Input validation via Zod schemas

## 20. Recommendations for Rebuild
1. Simplify draft/published system (remove complexity)
2. Remove preview functionality completely
3. Add proper product management UI
4. Add bulk product operations
5. Ensure proper multi-tenancy support
6. Improve cache invalidation
7. Add organizationId to HomePageSection if missing
8. Create dedicated section manager for product assignments
9. Add search and filtering for products
10. Implement drag-and-drop for reordering
