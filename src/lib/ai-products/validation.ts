import { z } from "zod";

export const aiProductWorkflowSchema = z.enum(["DRAFT", "REVIEW_REQUIRED", "AUTO_PUBLISH"]);

export const aiProductInputSchema = z.object({
  productName: z.string().trim().max(180).optional(),
  supplierInfo: z.string().trim().max(12000).optional(),
  // Allow empty string (from some UIs) and treat it as “not provided”.
  productUrl: z.union([
    z.string().trim().url(),
    z.literal(""),
    z.undefined(),
  ]).optional(),
  imageUrls: z.array(z.string().trim().min(1)).max(12).default([]),
  targetLanguage: z.enum(["fr", "en", "ar"]).default("fr"),
  tone: z.enum(["premium", "technical", "friendly", "conversion"]).default("premium"),
}).transform((value) => {
  // Normalize empty-string URL into undefined so the refinement works reliably
  return {
    ...value,
    productUrl: value.productUrl === "" ? undefined : value.productUrl,
  };
}).refine(
  (value) => Boolean(value.productName || value.supplierInfo || value.productUrl || value.imageUrls.length),
  "Provide a product name, supplier info, product URL, or at least one image."
);

export const aiImageAnalysisSchema = z.object({
  imageUrls: z.array(z.string().trim().min(1)).min(1).max(12),
  productName: z.string().trim().max(180).optional(),
});

export const aiProductOptimizeSchema = z.object({
  productId: z.string().uuid(),
  instruction: z.enum(["rewrite", "seo", "title", "marketing", "faq", "full"]).default("full"),
  notes: z.string().trim().max(2000).optional(),
});

export const aiProductPublishSchema = z.object({
  generationId: z.string().uuid(),
  productId: z.string().uuid().optional(),
  workflow: aiProductWorkflowSchema,
  categoryId: z.string().uuid(),
  price: z.number().positive(),
  comparePrice: z.number().positive().nullable().optional(),
  cost: z.number().positive().nullable().optional(),
  sku: z.string().trim().min(1).max(80),
  stock: z.number().int().min(0),
  lowStockAt: z.number().int().min(0).default(5),
  weight: z.number().positive().nullable().optional(),
  images: z.array(z.string().trim().min(1)).min(1),
  tags: z.array(z.string().trim()).default([]),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10),
  featured: z.boolean().default(false),
  revisionNote: z.string().trim().max(500).optional(),
});

export const aiProductBulkSchema = z.object({
  csv: z.string().trim().max(50000).optional(),
  imageUrls: z.array(z.string().trim().min(1)).max(50).default([]),
  workflow: aiProductWorkflowSchema.default("REVIEW_REQUIRED"),
}).refine((value) => Boolean(value.csv || value.imageUrls.length), "Upload CSV text or images.");

export const rollbackRevisionSchema = z.object({
  note: z.string().trim().max(500).optional(),
});
