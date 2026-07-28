# Mystery Box Admin Integration Guide

## Overview
The redesigned Mystery Box mobile page (`/m/mystery-box`) is fully integrated with the admin dashboard while maintaining complete backend compatibility. All frontend features are driven by admin-controlled data.

## Data Flow

### 1. Mystery Box Creation (Admin Dashboard)
Location: `/admin/mystery-box/new` or `/admin/mystery-box/[id]/edit`

Admin can configure:
- **Box Name** - Display name (e.g., "Bronze Box", "Silver Box")
- **Tier Level** - Determines color scheme (bronze, silver, gold, platinum)
- **Price** - Sale price in MAD
- **Value Label** - Display text (e.g., "Worth up to 5000 MAD")
- **Stock Quantity** - Available inventory
- **Possible Rewards** - Products that can be in the box
- **Reward Probabilities** - % chance for each item
- **Images** - Hero banner and product images
- **Active Status** - Enable/disable the box
- **Campaign Dates** - Schedule box availability

### 2. API Endpoint

**GET `/api/admin/mystery-box`**
- Returns all mystery boxes with full details
- Used by admin dashboard and mobile page
- Authentication: Required (admin role)
- Response format:
```json
{
  "data": [
    {
      "id": "1",
      "name": "Bronze Box",
      "tier": "bronze",
      "price": 2990,
      "stock": 250,
      "valueLabel": "Worth up to 5000 MAD",
      "rewards": [
        {
          "productId": "1",
          "probability": 50,
          "name": "Argan Oil Premium 100ml",
          "image": "...",
          "value": 2499
        }
      ],
      "totalSales": 1240,
      "active": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**POST `/api/admin/mystery-box`**
- Create a new mystery box
- Body: Mystery box configuration object
- Returns: Created box with ID

### 3. Mobile Page Data Flow

```
Admin Dashboard
    ↓
Mystery Box Config
    ↓
/api/admin/mystery-box (GET)
    ↓
MysteryBoxPageClientNew
    ↓
Renders:
- PremiumBoxCard (from boxes data)
- MysteryRevealSection (from possibleRewards)
- FlashDealsSection (uses stock/pricing)
```

## Component Structure

### Mobile Components

#### MysteryBoxHeader
- Back button (returns to /m home)
- Title with subtitle
- Search icon (extensible)
- Cart icon with counter
- **No admin control needed** (fixed UI)

#### HeroSection
- Cinematic banner with animations
- Admin can control via bannerImage prop
- Future: Admin can upload custom banners

#### CategoryCards
- 6 hardcoded categories (can be made admin-configurable)
- Filter boxes by category (future feature)

#### PremiumBoxCard
- **Uses admin data:**
  - `box.name` - Box name
  - `box.price` - Price
  - `box.stock` - Remaining stock
  - `box.valueLabel` - Value promise
  - `box.description` - Description
  - Tier colors from `box.tier`
  - Rating/reviews (can use totalSales)

#### FlashDealsSection
- **Uses admin data:**
  - `box.price` - For discount calculation
  - `box.stock` - For "X left" indicator
  - `box.active` - Show/hide status
- Future: Admin field for "is_flash_deal"

#### MysteryRevealSection
- **Uses admin data:**
  - `box.possibleRewards[]` - Product images/names/prices
  - Shows all possible items from rewards array

#### CustomerReviewsSection
- Currently using sample data
- Future: Connect to orders/reviews API
- Admin can add featured reviews

#### TrustSection
- Static badges (no admin control)
- Reflects NexStore brand identity

## Admin Workflow

### Creating a New Mystery Box

1. **Go to Admin Dashboard:**
   ```
   /admin/mystery-box → Click "Create Box"
   ```

2. **Fill Box Details:**
   - Name: "Gold Box"
   - Tier: "gold"
   - Price: 9990 MAD
   - Value Label: "Worth up to 25000 MAD"
   - Description: "Premium selection with luxury items"
   - Stock: 50

3. **Add Reward Products:**
   - Select products from catalog
   - Set probability for each:
     ```
     Leather Bag: 50%
     Berber Carpet: 30%
     Tea Set: 20%
     ```

4. **Upload Images:**
   - Banner image (hero section)
   - Product images appear from reward items

5. **Set Campaign:**
   - Start date/time
   - End date/time (optional)
   - Active status toggle

6. **Save & Publish**
   - Box appears on `/m/mystery-box`
   - Shows in flash deals if active
   - Included in cart add operations

### Editing Existing Box

1. Admin Dashboard → Box list → Click "Edit"
2. Modify any field
3. Changes reflect immediately on mobile page
4. API caches for 5 minutes (adjust in backend)

### Managing Stock & Sales

- **Stock Display:**
  - Shows "X left" when stock < 50
  - Red alert when stock < 20
  - "Out of stock" when stock = 0

- **Sales Tracking:**
  - `totalSales` field from API
  - Displayed in admin dashboard
  - Used for "342 sold" on mobile card

### Flash Deals Setup

Currently mocked, but admin can:
1. Set `isFlashDeal: true` on box
2. Set `discountPercent: 25`
3. Set `dealEndsAt: ISO datetime`
4. Box appears in FlashDealsSection
5. Countdown timer updates in real-time

## Tier System

Admin selects tier which controls:

| Tier | Color | Emoji | Common Price Range |
|------|-------|-------|-------------------|
| Bronze | Amber/Orange | 🎁 | 1000-3000 MAD |
| Silver | Slate | 🎁 | 3000-7000 MAD |
| Gold | Yellow | 🎁 | 7000-15000 MAD |
| Platinum | Purple | 🎁 | 15000+ MAD |

Colors auto-apply to:
- Card header gradient
- Stock progress bar
- Discount badge
- Add to cart button

## Future Enhancements

### Planned Features

1. **Dynamic Categories:**
   - Admin configures categories
   - Boxes tagged by category
   - Mobile page filters by category

2. **Custom Banner Upload:**
   - Admin uploads hero banner
   - Replaces default animated gradient
   - Supports seasonal campaigns

3. **Featured Box Selection:**
   - Admin "pin" favorite boxes
   - Pinned boxes appear at top
   - Limit to 2-3 featured

4. **Review Management:**
   - Admin adds customer reviews
   - Feature best reviews
   - Admin can screenshot and upload

5. **Email Campaigns:**
   - "New Mystery Box Available" email
   - Flash deal countdown emails
   - "Box Low in Stock" alerts

6. **Analytics Dashboard:**
   - Box performance metrics
   - Conversion rates
   - Average order value
   - Customer demographics

## Data Persistence

Current state: **Mock data** from API endpoint

Planned: **Prisma Database**

```prisma
model MysteryBox {
  id                String      @id @default(cuid())
  organizationId    String
  name              String
  slug              String      @unique
  description       String?
  tier              String      // "bronze" | "silver" | "gold" | "platinum"
  price             Int
  valueLabel        String
  image             String?
  stock             Int
  lowStockThreshold Int         @default(20)
  active            Boolean     @default(true)
  isFlashDeal       Boolean     @default(false)
  discountPercent   Int?
  rewards           Reward[]
  totalSales        Int         @default(0)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model Reward {
  id              String      @id @default(cuid())
  mysteryBoxId    String
  mysteryBox      MysteryBox  @relation(fields: [mysteryBoxId], references: [id])
  productId       String
  product         Product     @relation(fields: [productId], references: [id])
  probability     Int         // 0-100
  position        Int         // Order in box
}
```

## Testing Checklist

- [ ] Add mystery box from admin
- [ ] Verify appears on mobile page
- [ ] Check tier colors apply correctly
- [ ] Test "Add to Cart" functionality
- [ ] Verify stock count updates
- [ ] Test flash deal countdown
- [ ] Edit box and confirm changes reflect
- [ ] Test mobile responsiveness (390px+)
- [ ] Verify animations smooth on mobile
- [ ] Test cart integration

## Support & Troubleshooting

### Box not appearing on mobile page
1. Check if `active: true` in admin
2. Verify stock > 0
3. Clear browser cache
4. Restart development server

### Images not loading
1. Check image URLs in admin
2. Verify product images exist
3. Check Cloudinary/CDN access

### Performance issues
1. Limit reward items to 6-8
2. Optimize images (max 500KB)
3. Enable API caching (5-10 minutes)

## API Documentation

See `/api/admin/mystery-box` route for full details:
- `src/app/api/admin/mystery-box/route.ts`
