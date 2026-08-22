import { z } from "zod";
import { cmsContentStatusSchema, ctaButtonSchema, optionalDateSchema, optionalUrlSchema } from "./common";

export const heroAnimationSchema = z.object({
  preset: z.enum(["fade", "slide-up", "slide-left", "zoom", "none"]).default("fade"),
  duration: z.number().min(0).max(5000).default(600),
  delay: z.number().min(0).max(3000).default(0),
  easing: z.string().default("ease-out"),
});

export const heroBannerSchema = z.object({
  badgeText: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  highlightedText: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  desktopImageUrl: optionalUrlSchema,
  mobileImageUrl: optionalUrlSchema.nullable(),
  videoUrl: optionalUrlSchema,
  primaryButtonText: z.string().optional(),
  primaryButtonLink: optionalUrlSchema,
  secondaryButtonText: z.string().optional(),
  secondaryButtonLink: optionalUrlSchema,
  ctaButtons: z.array(ctaButtonSchema).default([]),
  backgroundColor: z.string().optional(),
  backgroundOverlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).default(0.5),
  textColor: z.string().optional(),
  primaryButtonColor: z.string().optional(),
  secondaryButtonColor: z.string().optional(),
  heroHeight: z.string().default("90vh"),
  heroPosition: z.string().default("center"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  status: cmsContentStatusSchema.default("DRAFT"),
  publishDate: optionalDateSchema,
  expireDate: optionalDateSchema,
  priorityScore: z.number().int().min(0).max(100).default(0),
  templateId: z.string().uuid().optional().nullable(),
  abTestGroupId: z.string().uuid().optional().nullable(),
  animationSettings: heroAnimationSchema.optional(),
});

export const heroBannerReorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      displayOrder: z.number().int(),
    })
  ),
});

export const heroBannerDuplicateSchema = z.object({
  id: z.string().uuid(),
});

export const heroABTestSchema = z.object({
  name: z.string().min(1),
  variantAId: z.string().uuid(),
  variantBId: z.string().uuid(),
  trafficSplit: z.number().min(0.1).max(0.9).default(0.5),
});

export type HeroBannerInput = z.infer<typeof heroBannerSchema>;
export type HeroBannerReorderInput = z.infer<typeof heroBannerReorderSchema>;
