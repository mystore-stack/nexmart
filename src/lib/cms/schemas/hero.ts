import { z } from "zod";
import { cmsContentStatusSchema, ctaButtonSchema, optionalDateSchema, optionalUrlSchema } from "./common";

export const heroAnimationSchema = z.object({
  preset: z.enum(["fade", "slide-up", "slide-left", "zoom", "none"]).default("fade"),
  duration: z.number().min(0).max(5000).default(600),
  delay: z.number().min(0).max(3000).default(0),
  easing: z.string().default("ease-out"),
});

export const heroDimensionsSchema = z.object({
  // Desktop settings
  desktopWidth: z.string().default("100%"),
  desktopHeight: z.number().min(150).max(800).default(420),
  desktopMaxWidth: z.number().positive().default(1440),
  desktopAspectRatio: z.string().default("2.5/1"),
  
  // Tablet settings
  tabletWidth: z.string().default("100%"),
  tabletHeight: z.number().min(150).max(800).default(320),
  tabletMaxWidth: z.number().positive().default(1024),
  tabletAspectRatio: z.string().default("2.5/1"),
  
  // Mobile settings
  mobileWidth: z.string().default("100%"),
  mobileHeight: z.number().min(150).max(800).default(280),
  mobileMaxWidth: z.number().positive().default(640),
  mobileAspectRatio: z.string().default("2.5/1"),
  
  // Global settings
  widthMode: z.enum(["fullWidth", "container", "custom"]).default("fullWidth"),
  imageFit: z.enum(["cover", "contain", "fill"]).default("cover"),
  imagePosition: z.enum(["center", "left", "right", "top", "bottom", "custom"]).default("center"),
  imagePositionX: z.string().default("50%"),
  imagePositionY: z.string().default("50%"),
  borderRadius: z.string().default("0.5rem"),
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
  dimensions: heroDimensionsSchema.optional(),
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
export type HeroDimensionsInput = z.infer<typeof heroDimensionsSchema>;
