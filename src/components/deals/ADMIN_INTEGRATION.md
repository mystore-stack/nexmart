# Deals Page - Admin Integration Guide

## Overview
The redesigned Deals page (`/m/deals`) is fully integrated with the existing admin dashboard while preserving all backend APIs and database structures. All frontend features are driven by admin-controlled data.

## Data Flow

### 1. Deal Management (Admin Dashboard)
Location: `/admin/deals` (existing)

Admin can configure:
- **Deal Selection:** Choose products to feature as deals
- **Discount Type:** Percentage or fixed amount
- **Time Window:** Start and end times for deal duration
- **Stock Limits:** Maximum quantity available
- **Urgency Flag:** Mark deals as urgent/featured
- **Pause/Resume:** Control deal visibility without deletion
- **Campaign Status:** Track active/scheduled/expired deals

### 2. API Endpoint (Preserved)

**GET `/api/admin/deals`**
- Returns all deals with full details
- Used by admin dashboard and mobile page
- Authentication: Required (admin role)
- Response format:
```json
{
  "data": [
    {
      "id": "deal-1",
      "productId": "product-1",
      "product": {
        "id": "product-1",
        "name": "Premium Product",
        "images": ["url"],
        "price": 5000,
        "comparePrice": 7000,
        "stock": 100,
        "rating": 4.5,
        "soldCount": 150,
        ...
      },
      "discountPercentage": 29,
      "regularPrice": 7000,
      "salePrice": 5000,
      "stockLimit": 100,
      "stockRemaining": 45,
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T14:00:00Z",
      "active": true,
      "urgent": true,
      "paused": false,
      "status": "active",
      "createdAt": "2024-01-15T09:00:00Z"
    }
  ]
}
```

**POST `/api/admin/deals`**
- Create a new deal
- Body: Deal configuration object
- Returns: Created deal with ID

**PUT `/api/admin/deals/:id`**
- Update existing deal
- Supports: discount, stock, dates, active status, pause toggle
- Returns: Updated deal

**DELETE `/api/admin/deals/:id`**
- Soft delete (or set active: false)
- Returns: Confirmation

### 3. Mobile Page Data Flow

```
Admin Dashboard (/admin/deals)
    ↓
Deal Configuration (discount, stock, dates, urgency)
    ↓
API: GET /api/admin/deals
    ↓
DealsPageClientNew
    ↓
Renders:
- HeroBanner (admin-controlled image, text, CTA)
- DealCategories (filtered by category, if implemented)
- FlashDealCard (from deals array)
- BundleDealsSection (admin-curated bundles)
- SuperDealsSection (featured collections)
- SponsoredDealsSection (admin-promoted items)
- RecommendedDealsSection (personalized)
```

## Component Structure

### Mobile Components

#### DealsHeader
- Back button (returns to /m home)
- Title: "Deals" with "Best offers every day" subtitle
- Search icon (extensible)
- Wishlist icon (extensible)
- Cart icon with counter
- **No admin control needed** (fixed UI)

#### HeroBanner
- Admin-controlled via campaign management:
  - Banner image URL
  - Title text (e.g., "Flash Sale")
  - Subtitle (e.g., "Up to 70% off")
  - CTA text ("Shop Now")
  - Campaign end time (countdown updates live)
- Default fallback: Gradient background with animations

#### DealCategories
- 7 hardcoded categories (can be made admin-configurable in future)
- Filter functionality for category-specific deals (future)
- Counts from filtered deal data

#### FlashDealCard
- **Uses admin data:**
  - `deal.product` - Product name, images, rating
  - `deal.salePrice` - Discounted price
  - `deal.regularPrice` - Original price
  - `deal.discountPercentage` - Calculated from prices
  - `deal.stockLimit` & `deal.stockRemaining` - Stock tracking
  - `deal.endTime` - Countdown timer
  - `deal.urgent` - Show urgency badge
  - `deal.status` - Show/hide based on active status
- Cart integration: Adds product to Zustand store

#### BundleDealsSection
- Currently using default bundles (mock data)
- Future: Admin can create bundles by grouping products
- Should link to `/admin/bundles` management

#### SuperDealsSection
- **Uses admin data:**
  - Top featured deals from `deals` array
  - Sorted by admin curation (position/featured flag)
- Shows best-selling or admin-picked collections

#### SponsoredDealsSection
- Currently using default sponsored items
- Future: Admin can promote products as sponsored
- Budget/duration management in admin

#### RecommendedDealsSection
- Currently showing random deals
- Future: Connect to user behavior/recommendations API
- Show personalized based on view history

#### TrustSection
- Static badges (no admin control)
- Reflects NexStore brand identity

## Admin Workflow

### Creating a Flash Deal

1. **Go to Admin Dashboard:**
   ```
   /admin/deals → Click "Create Deal" or edit existing product
   ```

2. **Select Product:**
   - Choose from product catalog
   - Verify product details display correctly

3. **Configure Discount:**
   - Set discount percentage (5-70%)
   - Or set fixed discount amount
   - Live preview shows sale price
   - Example: Original 10,000 MAD → -30% → 7,000 MAD

4. **Set Duration:**
   - Start date/time
   - End date/time
   - Countdown timer will show remaining time on mobile

5. **Configure Stock:**
   - Set stock limit (available quantity)
   - Track remaining stock as sales increase
   - Progress bar shows depletion

6. **Set Urgency:**
   - Mark as urgent (shows "Hurry" badge)
   - Applied when stock < 20% or admin selects

7. **Pause/Resume:**
   - While deal is active, admin can pause without losing config
   - Paused deals don't show on mobile
   - Can resume instantly

8. **Save & Publish**
   - Deal appears on `/m/deals` immediately
   - Live countdown starts
   - Counts toward active deals

### Editing Existing Deal

1. Admin Dashboard → Deal list → Click "Edit"
2. Modify any field (discount, stock, duration, urgency, etc.)
3. Save changes
4. Mobile page reflects changes immediately (within cache timeout)
5. Or manually refresh to see updates

### Managing Stock & Sales

- **Stock Display:**
  - Shows "X sold" on cards
  - Progress bar shows remaining inventory
  - Red alert when stock < 20%

- **Sales Tracking:**
  - `soldCount` field increments on purchase
  - Displayed in admin dashboard
  - Used for "Top Deals" ranking

### Flash Deal Setup

1. Admin Dashboard → Create Deal
2. Set discount percentage and stock
3. Set end time (2-6 hours typical for flash deals)
4. Mark as urgent if low stock
5. Publish
6. Countdown timer appears on mobile
7. Deal auto-expires at end time

### Campaign Management

Planned features for future phases:
- Campaign grouping (multiple deals per campaign)
- Campaign start/end scheduling
- Budget allocation per campaign
- Performance analytics per campaign
- A/B testing different discount levels

## Tier/Category System

### Deal Categories
- Flash Deals: Limited time, high discount
- Electronics: Tech products with deals
- Fashion: Apparel and fashion items
- Home: Furniture and home goods
- Beauty: Cosmetics and beauty products
- Gaming: Gaming and entertainment
- Moroccan: Local/artisan products

**Future admin feature:**
- Assign categories to deals
- Filter mobile page by category
- Category-specific hero banners

## Future Admin Enhancements

### Phase 2 Features

1. **Bundle Management:**
   - Admin creates product bundles
   - Set bundle price vs. individual prices
   - Show savings percentage
   - Admin dashboard for bundle CRUD

2. **Sponsored/Promoted Deals:**
   - Admin marks products as sponsored
   - Set promotion duration
   - Budget per product
   - Simple analytics (clicks, conversions)

3. **Campaign Builder:**
   - Create campaigns with multiple deals
   - Scheduling (schedule in advance)
   - Campaign-level analytics
   - Bulk import deals

4. **Personalization Rules:**
   - Admin configures recommendation logic
   - Based on: purchase history, view history, category preferences
   - Override personalization with featured products

5. **Banner Management:**
   - Admin uploads custom hero banners
   - Supports video content
   - Multi-language support
   - Campaign-specific banners

6. **Analytics Dashboard:**
   - Deal performance metrics
   - Click-through rate (CTR)
   - Conversion rate
   - Average order value
   - Customer demographics

## Data Persistence

### Current Implementation
- Uses existing `Product` model with `comparePrice` as deal indicator
- Deals calculated on-the-fly from products with `comparePrice`
- Stock tracking via `Product.stock` field

### Database Schema (Existing)
```prisma
model Deal {
  id             String        @id @default(uuid())
  organizationId String
  campaignId     String?
  name           String
  slug           String
  type           DealType      @default(FLASH)
  discountType   DiscountType  @default(PERCENTAGE)
  discountValue  Float
  startsAt       DateTime
  endsAt         DateTime
  stockLimit     Int?
  soldCount      Int           @default(0)
  active         Boolean       @default(true)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  Campaign       Campaign?
  Organization   Organization
  products       DealProduct[]
  @@unique([organizationId, slug])
  @@index([organizationId, active, startsAt, endsAt])
}

model DealProduct {
  id        String
  dealId    String
  productId String
  price     Float?
  stock     Int?
  position  Int
  Deal      Deal
  Product   Product
  @@unique([dealId, productId])
  @@index([dealId])
}
```

## Testing Checklist

- [ ] Admin can create deal with discount
- [ ] Deal appears on mobile page immediately
- [ ] Countdown timer updates in real-time
- [ ] Stock tracking shows remaining quantity
- [ ] Admin can edit deal and mobile reflects changes
- [ ] Admin can pause deal (disappears from mobile)
- [ ] Admin can resume deal (reappears on mobile)
- [ ] Stock progress bar color changes (green > yellow > red)
- [ ] "Urgent" badge shows when admin marks it
- [ ] "Urgent" badge shows automatically when stock < 20%
- [ ] Prices formatted correctly in MAD currency
- [ ] Cart add works from deal cards
- [ ] Search filters deals by keyword
- [ ] Categories filter deals (if implemented)
- [ ] Bundle deals show correct savings
- [ ] Recommended deals vary (or show personalized)

## Support & Troubleshooting

### Deal Not Appearing on Mobile
1. Check if `active: true` in admin
2. Verify `startsAt` <= now and `endsAt` > now
3. Check if product has `comparePrice` set
4. Clear browser cache
5. Restart dev server

### Images Not Loading
1. Verify image URLs in product/deal
2. Check Cloudinary/CDN access
3. Check product images array not empty

### Countdown Not Updating
1. Check browser console for errors
2. Verify `endTime` is valid ISO datetime
3. Check user's device time is correct
4. Hard refresh browser

### Stock Not Updating
1. Check `stockRemaining` calculation
2. Verify stock deducts on purchase
3. Check Zustand store integration
4. Verify API updates stock on order

## Performance Optimization

### Caching Strategy
- Cache deals API response for 5 minutes
- Countdown timers update client-side (no server calls)
- Images lazy-loaded by Next.js Image component
- Code split deal components

### Data Optimization
- Only fetch active deals
- Limit to necessary product fields
- Paginate if 1000+ deals exist
- Archive expired deals

## API Documentation

See `/api/admin/deals` route for full implementation:
- `src/app/api/admin/deals/route.ts`

Current implementation handles:
- GET: Fetch all deals (transform from products with comparePrice)
- POST: Create deal (update product comparePrice)
- PUT: Update deal (future implementation)
- DELETE: Remove deal (future implementation)
