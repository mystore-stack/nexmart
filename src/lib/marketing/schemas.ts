import { z } from "zod";

const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url().optional().nullable()
);

const optionalDate = z.preprocess(
  emptyToUndefined,
  z.union([z.string(), z.date()]).optional()
);

export const advertisementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subtitle: z.string().max(300).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  imageDesktop: optionalUrl,
  imageMobile: optionalUrl,
  videoUrl: optionalUrl,
  ctaText: z.string().max(80).optional().nullable(),
  ctaUrl: z.string().max(500).optional().nullable(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#0F766E"),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#FFFFFF"),
  placement: z.enum([
    "HOMEPAGE_HERO",
    "TOP_BANNER",
    "BETWEEN_PRODUCT_SECTIONS",
    "CATEGORY_PAGE",
    "PRODUCT_PAGE",
    "SIDEBAR",
    "FOOTER",
    "POPUP",
    "FLOATING_BANNER",
  ]),
  priority: z.coerce.number().int().min(0).max(1000).default(0),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED", "EXPIRED"]).default("DRAFT"),
  startDate: optionalDate,
  endDate: optionalDate,
  campaignId: z.preprocess(emptyToUndefined, z.string().uuid().optional().nullable()),
  targetCountries: z.array(z.string()).default([]),
  targetLanguages: z.array(z.string()).default([]),
  targetDevices: z.enum(["ALL", "DESKTOP", "MOBILE", "TABLET"]).default("ALL"),
  visitorTarget: z.enum(["ALL", "NEW_VISITORS", "RETURNING_VISITORS", "LOGGED_IN", "GUEST"]).default("ALL"),
});

export const promoCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  type: z.enum(["BLACK_FRIDAY", "RAMADAN", "EID", "SUMMER_SALE", "WINTER_SALE", "CUSTOM"]),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED", "EXPIRED"]).default("DRAFT"),
  startDate: optionalDate,
  endDate: optionalDate,
  bannerColor: z.preprocess(emptyToUndefined, z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable()),
});

export const sponsoredProductSchema = z.object({
  productId: z.string().uuid(),
  priority: z.coerce.number().int().min(0).max(1000).default(0),
  badgeText: z.string().max(50).default("Sponsored"),
  startDate: optionalDate,
  endDate: optionalDate,
  isActive: z.boolean().default(true),
});

export const flashDealSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  campaignId: z.string().uuid().optional().nullable(),
  discountPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  discountAmount: z.coerce.number().min(0).optional().nullable(),
  startDate: z.union([z.string(), z.date()]),
  endDate: z.union([z.string(), z.date()]),
  autoStart: z.boolean().default(true),
  autoEnd: z.boolean().default(true),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED", "EXPIRED"]).default("DRAFT"),
  isActive: z.boolean().default(false),
  productIds: z.array(z.object({
    productId: z.string().uuid(),
    discountPercent: z.coerce.number().min(0).max(100).optional().nullable(),
    discountPrice: z.coerce.number().min(0).optional().nullable(),
    displayOrder: z.coerce.number().int().default(0),
  })).default([]),
});

export const trackEventSchema = z.object({
  adId: z.string().uuid().optional(),
  flashDealId: z.string().uuid().optional(),
  sponsoredProductId: z.string().uuid().optional(),
  eventType: z.enum(["view", "click", "conversion"]),
  deviceType: z.string().optional(),
  country: z.string().optional(),
  sessionId: z.string().optional(),
  revenue: z.coerce.number().optional(),
});

export type AdvertisementInput = z.infer<typeof advertisementSchema>;
export type PromoCampaignInput = z.infer<typeof promoCampaignSchema>;
export type SponsoredProductInput = z.infer<typeof sponsoredProductSchema>;
export type FlashDealInput = z.infer<typeof flashDealSchema>;

export function parseDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  return new Date(String(value));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
