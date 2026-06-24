import { z } from "zod";
import { cmsContentStatusSchema, deviceTargetSchema, optionalDateSchema, optionalUrlSchema } from "./common";

export const announcementBarSchema = z.object({
  text: z.string().min(1, "Announcement text is required"),
  icon: z.string().optional(),
  backgroundColor: z.string().default("#000000"),
  textColor: z.string().default("#ffffff"),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
  status: cmsContentStatusSchema.default("DRAFT"),
  geoTargeting: z
    .object({
      countries: z.array(z.string()).default([]),
      excludeCountries: z.array(z.string()).default([]),
    })
    .optional(),
  deviceTargeting: deviceTargetSchema.default("ALL"),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: optionalUrlSchema,
  countdownEnd: optionalDateSchema,
  stickyMode: z.boolean().default(true),
  dismissible: z.boolean().default(true),
});

export const announcementReorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      displayOrder: z.number().int(),
    })
  ),
});

export type AnnouncementBarInput = z.infer<typeof announcementBarSchema>;
