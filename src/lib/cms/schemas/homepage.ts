import { z } from "zod";
import { cmsContentStatusSchema, deviceTargetSchema, optionalDateSchema } from "./common";

export const homepageSectionTypeSchema = z.enum([
  "HERO",
  "CATEGORIES",
  "FLASH_DEALS",
  "FLASH_SALE",
  "BUNDLE_DEALS",
  "MYSTERY_BOXES",
  "FEATURED_PRODUCTS",
  "AI_RECOMMENDATIONS",
  "BEST_SELLERS",
  "BRANDS",
  "WHY_NEXMART",
  "TESTIMONIALS",
  "SEASONAL_COLLECTION",
  "MOBILE_APP",
  "NEWSLETTER",
  "FOOTER",
  "RECENTLY_VIEWED",
  "EDITORS_CHOICE",
  "PROMOTIONAL_CARDS",
  "TRENDING_PRODUCTS",
  "SERVICE_BANNERS",
  "SHOWCASE_GRID",
  "BANNER",
  "NEW_ARRIVALS",
  "CUSTOM",
  "MEGA_PROMO",
  "SEASONAL",
  "RECOMMENDED",
  "BRAND_CAROUSEL",
  "MOBILE_APP_BANNER",
]);

export const homepageSectionSchema = z.object({
  id: z.string().optional(),
  type: homepageSectionTypeSchema,
  title: z.string().optional(),
  subtitle: z.string().optional(),
  config: z.record(z.unknown()).default({}),
  isVisible: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
  templateId: z.string().optional(),
});

export const homepageBuilderSchema = z.object({
  sections: z.array(homepageSectionSchema),
  newsletterEnabled: z.boolean().default(true),
  newsletterTitle: z.string().optional(),
  newsletterSubtitle: z.string().optional(),
  status: cmsContentStatusSchema.default("DRAFT"),
  featuredCategories: z.array(z.string()).default([]),
  featuredProducts: z.array(z.string()).default([]),
  featuredBrands: z.array(z.string()).default([]),
});

export const homepagePublishSchema = z.object({
  note: z.string().optional(),
});

export const homepageRollbackSchema = z.object({
  versionId: z.string().uuid(),
});

export const homepageSectionReorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      displayOrder: z.number().int(),
      isVisible: z.boolean().optional(),
    })
  ),
});

export type HomepageSectionInput = z.infer<typeof homepageSectionSchema>;
export type HomepageBuilderInput = z.infer<typeof homepageBuilderSchema>;

