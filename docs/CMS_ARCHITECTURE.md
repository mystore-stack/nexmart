# NexMart Enterprise CMS Architecture

Production-grade content management system for the NexMart admin dashboard.

## Folder Structure

```
src/
├── app/
│   ├── admin/cms/                    # CMS admin routes
│   │   ├── page.tsx                  # CMS Hub dashboard
│   │   ├── layout.tsx
│   │   ├── hero/page.tsx
│   │   ├── homepage/page.tsx         # Visual page builder
│   │   ├── announcement/page.tsx
│   │   ├── footer/page.tsx
│   │   ├── media/page.tsx
│   │   ├── navigation/page.tsx
│   │   ├── brands/page.tsx
│   │   ├── campaigns/page.tsx
│   │   └── analytics/page.tsx
│   └── api/admin/cms/                # CMS REST API
│       ├── hero/route.ts
│       ├── analytics/route.ts
│       ├── navigation/route.ts
│       └── brands/route.ts
├── components/admin/cms/
│   ├── shell/                        # CmsShell, CommandPalette (⌘K)
│   ├── shared/                       # DragDropList, PreviewPanel, MetricCard
│   ├── hero/HeroBannerManager.tsx
│   ├── homepage/HomepageBuilder.tsx
│   ├── navigation/NavigationManager.tsx
│   ├── brands/BrandManager.tsx
│   └── analytics/CmsAnalyticsClient.tsx
└── lib/cms/
    ├── actions/index.ts              # Server Actions ("use server")
    ├── schemas/                      # Zod validation
    ├── rbac.ts                       # Role-based permissions
    ├── auth.ts                       # CMS auth guards
    ├── analytics.ts                  # Metrics aggregation
    ├── audit.ts                      # Activity logging
    ├── cache.ts                      # Redis cache invalidation
    ├── constants.ts                  # Section types, modules
    └── types.ts                      # TypeScript interfaces
```

## Database Models (Prisma)

| Model | Purpose |
|-------|---------|
| `HeroBanner` | Extended with status, CTAs, A/B test, analytics |
| `HeroBannerTemplate` | Reusable banner templates |
| `HeroBannerABTest` | A/B testing groups |
| `HomepageSection` | Drag-and-drop homepage sections |
| `HomepageVersion` | Version history & rollback |
| `AnnouncementBar` | Geo/device targeting, UTM, countdown |
| `AnnouncementBarAnalytics` | Impression/click tracking |
| `FooterConfig` | Modular columns, badges, i18n |
| `MediaAsset` | Folders, WebP, AI tags, usage |
| `MediaFolder` | Folder hierarchy |
| `MediaUsage` | Asset usage tracking |
| `NavigationMenu` | Header/footer/mobile menus |
| `NavigationMenuItem` | Nested menu items |
| `Brand` | Brand management |
| `CmsActivityLog` | Audit trail |

## RBAC Roles

| Role | CMS Access |
|------|------------|
| `SUPER_ADMIN` | Full CMS + roles |
| `ADMIN` | Full CMS (no role mgmt) |
| `EDITOR` | Edit content, media, nav, brands |
| `MARKETING_MANAGER` | Publish, analytics, campaigns |

## Setup

```bash
cd nexmart-ma1-main
npm install
npx prisma migrate dev --name enterprise_cms
npm run dev
```

Visit `/admin/cms` for the CMS Hub.

## Key Features

- **Command Palette**: `Ctrl+K` / `⌘K` global search
- **Drag & Drop**: @dnd-kit for banners, sections, menus, brands
- **Live Preview**: Desktop/tablet/mobile device frames
- **Version History**: Homepage publish + rollback
- **Analytics**: Revenue, traffic, CTR, top banners (Recharts)
- **Server Actions**: Type-safe mutations with audit logging
- **Zod Validation**: Shared schemas for API + actions
