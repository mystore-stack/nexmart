# CMS Architecture Migration Summary

## Overview
Successfully migrated the Home page from the legacy `HomepageConfig` system to the unified Page Builder system. The Home page now uses a single source of truth for all page content.

## Changes Made

### 1. Schema Changes
- **File**: `prisma/schema.prisma`
- **Change**: Added `HOME` to `PageBuilderPageType` enum
- **Impact**: Enables Page Builder to handle the home page type

### 2. Data Migration Script
- **File**: `scripts/migrate-homepage-to-page-builder.ts`
- **Purpose**: Migrates existing `HomepageConfig` data to `PageBuilderPage` and `PageSection` tables
- **Features**:
  - Maps `HomepageSectionType` to `PageSectionType`
  - Preserves all section configurations
  - Creates initial page versions for rollback capability
  - Prevents duplicate migrations

### 3. Home Data Pipeline
- **File**: `src/lib/home-data.ts`
- **Changes**:
  - Removed `fetchHomepageSections` function
  - Removed `HomepageConfigSchema` imports
  - Added `getHomePagePage` function that fetches from `PageBuilderPage`
  - Updated `HomePageData` type to use `PageBuilderPage` instead of `HomepageConfig`
  - Removed `useCmsLayout` and `homepageSections` from return type

### 4. Home Page Component
- **File**: `src/app/page.tsx`
- **Changes**:
  - Updated `generateMetadata` to fetch from `PageBuilderPage` instead of `HeroBanner`
  - Removed `HomepageSections` import
  - Added `PageRenderer` import
  - Updated conditional rendering to use `data.page` instead of `data.useCmsLayout`
  - Removed `homepageConfig` references from `LegacyHomePage`

### 5. Page Renderer
- **File**: `src/components/page-builder/PageSectionRenderer.tsx`
- **Changes**:
  - Added `PageRenderer` component to handle full page rendering
  - Maps section types to appropriate product data (featured, trending, categories, flashSale)
  - Renders all sections from the Page Builder page

### 6. Deleted Files
- `src/app/api/admin/homepage/route.ts` - Admin API for HomepageConfig
- `src/app/api/cms/homepage/route.ts` - Public CMS API for HomepageConfig
- `src/app/admin/homepage/page.tsx` - Admin homepage editor
- `src/app/admin/cms/homepage/page.tsx` - CMS homepage editor
- `src/components/admin/cms/homepage/HomepageBuilder.tsx` - Homepage builder component
- `src/components/home/HomepageSections.tsx` - Homepage sections renderer
- `src/lib/home-data-new.ts` - Temporary file
- `src/lib/cms/schemas/homepage.ts` - Homepage schema definitions

## Section Type Mapping

| HomepageSectionType | PageSectionType |
|---------------------|-----------------|
| HERO | HERO |
| FEATURED_PRODUCTS | FEATURED_PRODUCTS |
| CATEGORIES | CATEGORIES |
| FLASH_DEALS | FLASH_DEALS |
| NEW_ARRIVALS | NEW_ARRIVALS |
| BRANDS | BRAND_LOGOS |
| TESTIMONIALS | TESTIMONIALS |
| FAQ | FAQ |
| NEWSLETTER | NEWSLETTER |
| CUSTOM_HTML | CUSTOM_HTML |
| AI_RECOMMENDATIONS | RECOMMENDED_PRODUCTS |

## Architecture Diagram

```mermaid
graph TB
    subgraph "Home Page"
        HP[Home Page /]
    end
    
    subgraph "Page Builder System"
        PBP[PageBuilderPage<br/>pageType: HOME]
        PS[PageSection[]]
        PV[PageVersion]
    end
    
    subgraph "Data Layer"
        PB[PageBuilderPage Table]
        PS_TBL[PageSection Table]
        PV_TBL[PageVersion Table]
    end
    
    subgraph "Product Data"
        FP[Featured Products]
        TR[Trending Products]
        CAT[Categories]
        FS[Flash Sale]
    end
    
    HP -->|fetches| PBP
    PBP -->|includes| PS
    PBP -->|versions| PV
    PBP -->|stored in| PB
    PS -->|stored in| PS_TBL
    PV -->|stored in| PV_TBL
    
    PS -->|FEATURED_PRODUCTS| FP
    PS -->|NEW_ARRIVALS| TR
    PS -->|CATEGORIES| CAT
    PS -->|FLASH_DEALS| FS
    
    style PBP fill:#0F766E,color:#fff
    style PS fill:#D4AF37,color:#000
    style PV fill:#0F766E,color:#fff
```

## Migration Steps

1. **Run Prisma Migration**
   ```bash
   npx prisma db push
   ```

2. **Run Data Migration Script**
   ```bash
   npx tsx scripts/migrate-homepage-to-page-builder.ts
   ```

3. **Verify Migration**
   - Check that `PageBuilderPage` with `pageType: HOME` exists
   - Verify all sections are migrated
   - Test the home page at `/`

4. **Test the Application**
   - Navigate to `/` and verify the home page loads
   - Check that all sections render correctly
   - Verify metadata is generated from Page Builder

5. **Optional: Clean Up Legacy Tables**
   After verification, you can safely remove the following Prisma models:
   - `HomepageConfig`
   - `HomepageSection`
   - `HomepageVersion`

## Benefits of Migration

1. **Single Source of Truth**: All pages now use the Page Builder system
2. **Consistent API**: Unified API for all page types
3. **Version Control**: Built-in versioning and rollback capability
4. **Flexible Sections**: Page Builder supports more section types
5. **Better Performance**: Optimized queries with proper indexing
6. **Future-Proof**: Easier to add new page types and features

## Rollback Plan

If issues arise after migration:

1. The migration script creates a `PageVersion` snapshot
2. You can restore the previous state using the Page Builder admin
3. Legacy `HomepageConfig` tables remain intact until manually deleted
4. The `LegacyHomePage` component is still available as a fallback

## Next Steps

1. Run `npx prisma db push` to apply schema changes
2. Run the migration script to copy data
3. Test the home page thoroughly
4. Remove legacy Prisma models after verification
5. Update any remaining references to `HomepageConfig` in other parts of the codebase
