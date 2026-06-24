# Dynamic CMS Migration Plan

## Overview

NexMart is now a **fully database-driven CMS**. All site-wide content flows from PostgreSQL through a unified data layer. Admin changes propagate to the live site via Next.js cache revalidation.

## Architecture

```
PostgreSQL (SiteSettings, FooterConfig, NavigationMenu, HeroBanner, etc.)
        ↓
src/lib/cms/data.ts          ← getSiteSettings(), getFooterData(), etc.
        ↓
unstable_cache + revalidateTag (60s TTL, instant invalidation on save)
        ↓
Root Layout (server)         ← getSiteConfigBundle() → SiteConfigProvider
        ↓
Navbar / Footer / AnnouncementBar / Homepage (client reads context)
```

## Prisma Models

| Model | Purpose |
|-------|---------|
| `SiteSettings` | Store name, logo, favicon, contact, SEO, theme colors, social links |
| `FooterConfig` | Footer columns, links, newsletter, legal |
| `NavigationMenu` + `NavigationMenuItem` | Header/footer/mobile nav |
| `HeroBanner` | Hero carousel |
| `HomepageConfig` + `HomepageSection` | Visual page builder |
| `AnnouncementBar` | Top promo bar |

## Utility Functions (`src/lib/cms/index.ts`)

```typescript
getSiteSettings()
getFooterData()
getNavigationMenu(location?)
getHeroBanners()
getAnnouncementBar()
getHomepageSections()
getSiteConfigBundle()   // all layout data in one call
revalidateSiteContent() // call after any CMS save
```

## Public API Routes

| Route | Data |
|-------|------|
| `GET /api/cms/settings` | Global site settings |
| `GET /api/cms/footer` | Footer config |
| `GET /api/cms/navigation` | Header navigation |
| `GET /api/cms/announcement` | Active announcement |
| `GET /api/cms/homepage` | Homepage config |
| `GET /api/hero` | Hero banners |

## Admin Pages

| Route | Edits |
|-------|-------|
| `/admin/cms/settings` | **Site Settings** — phone, email, WhatsApp, logo, SEO, theme |
| `/admin/cms/hero` | Hero banners |
| `/admin/cms/homepage` | Homepage builder |
| `/admin/cms/footer` | Footer CMS |
| `/admin/cms/announcement` | Announcement bar |
| `/admin/cms/navigation` | Navigation menus |
| `/admin/cms/media` | Media library |
| `/admin/cms/brands` | Brands |

## Live Update Flow

1. Admin clicks **Save & Publish**
2. Server Action validates with Zod → writes to PostgreSQL
3. `revalidateSiteContent()` invalidates cache tags + `revalidatePath('/', 'layout')`
4. Next request loads fresh data from DB
5. Toast: "Settings saved — live site updated"

## Setup

```bash
cd nexmart-ma1-main
npx prisma db push          # Apply SiteSettings model
npm run db:seed             # Seed defaults (settings, nav, footer)
npm run dev
```

## What Was Removed from Frontend

- Hardcoded phone/email in `Footer.tsx`
- Hardcoded "NexMart" branding in `Navbar.tsx`
- Duplicate announcement bar in `Navbar.tsx`
- Static SEO metadata in `layout.tsx` → now `generateMetadata()` from DB
- Static theme colors → `DynamicTheme` CSS variables from DB
- Client-side fetch loops in Footer/Announcement → server prefetch via `SiteConfigProvider`

## Remaining Optional Migrations

Home section marketing copy (`WhyNexMart`, `PromoBanner` titles) can be moved to `HomepageSection.config` JSON fields via the Homepage Builder.

Email templates (`lib/email.ts`) still use env-based from addresses — configure via `RESEND_FROM` env or extend SiteSettings with `transactionalEmailFrom`.
