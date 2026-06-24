import { z } from "zod";
import { optionalUrlSchema } from "./common";

export const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  slug: z.string().min(1).optional(),
  logoUrl: optionalUrlSchema,
  bannerUrl: optionalUrlSchema,
  description: z.string().optional(),
  website: optionalUrlSchema,
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

export type BrandInput = z.infer<typeof brandSchema>;
