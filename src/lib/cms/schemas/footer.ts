import { z } from "zod";
import { optionalUrlSchema } from "./common";

export const footerLinkSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  url: z.string().min(1),
  openInNewTab: z.boolean().default(false),
});

export const footerColumnSchema = z.object({
  id: z.string(),
  type: z.enum(["company", "shop", "support", "legal", "social"]),
  title: z.string().min(1),
  links: z.array(footerLinkSchema).default([]),
  displayOrder: z.number().int().default(0),
});

export const footerConfigSchema = z.object({
  logoUrl: optionalUrlSchema,
  description: z.string().optional(),
  socialLinks: z.array(
    z.object({
      platform: z.string(),
      url: z.string().url(),
      icon: z.string().optional(),
    })
  ).default([]),
  contactInfo: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    })
    .default({}),
  columns: z.array(footerColumnSchema).default([]),
  paymentIcons: z.array(z.string()).default([]),
  storeBadges: z.array(z.string()).default([]),
  copyrightText: z.string().optional(),
  newsletterSettings: z
    .object({
      enabled: z.boolean().default(true),
      title: z.string().optional(),
      placeholder: z.string().optional(),
    })
    .optional(),
  translations: z.record(z.record(z.string())).optional(),
  isActive: z.boolean().default(true),
});

export type FooterConfigInput = z.infer<typeof footerConfigSchema>;
export type FooterColumnInput = z.infer<typeof footerColumnSchema>;
