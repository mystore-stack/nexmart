import { z } from "zod";

const assetUrlSchema = z
  .string()
  .refine(
    (value) => {
      if (value === "") return true;
      if (/^\/(?!\/).+/.test(value)) return true;

      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid URL" },
  );

const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
  icon: z.string().optional(),
});

export const siteSettingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeTagline: z.string().optional().nullable(),
  logoUrl: assetUrlSchema.optional().nullable(),
  faviconUrl: assetUrlSchema.optional().nullable(),
  ogImageUrl: assetUrlSchema.optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  businessHours: z.string().optional().nullable(),
  supportEmail: z.string().email().optional().nullable().or(z.literal("")),
  socialLinks: z.array(socialLinkSchema).default([]),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.array(z.string()).default([]),
  siteUrl: z.string().url().optional().nullable().or(z.literal("")),
  twitterHandle: z.string().optional().nullable(),
  locale: z.string().default("fr_MA"),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),
  themeColorLight: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  themeColorDark: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  currency: z.string().default("MAD"),
  freeShippingThreshold: z.number().min(0).optional().nullable(),
  freeShippingMessage: z.string().optional().nullable(),
  searchPlaceholder: z.string().optional().nullable(),
  copyrightText: z.string().optional().nullable(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
