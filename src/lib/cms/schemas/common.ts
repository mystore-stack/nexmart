import { z } from "zod";

export const cmsContentStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "SCHEDULED",
  "ARCHIVED",
  "EXPIRED",
]);

export const deviceTargetSchema = z.enum(["ALL", "DESKTOP", "MOBILE", "TABLET"]);

export const optionalUrlSchema = z
  .preprocess((val) => {
    if (typeof val === "string" && val.trim() === "") return undefined;
    return val;
  }, z.string().url("Invalid URL").optional());

export const optionalDateSchema = z
  .string()
  .datetime({ offset: true })
  .optional()
  .or(z.literal(""))
  .nullable();

export const ctaButtonSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1),
  link: z.string().min(1),
  style: z.enum(["primary", "secondary", "outline", "ghost"]).default("primary"),
  color: z.string().optional(),
  openInNewTab: z.boolean().default(false),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CtaButton = z.infer<typeof ctaButtonSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
