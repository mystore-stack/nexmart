import { z } from "zod";

export const mediaUploadSchema = z.object({
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number().int().positive(),
  url: z.string().url(),
  webpUrl: z.string().url().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  alt: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  folderId: z.string().uuid().optional().nullable(),
});

export const mediaUpdateSchema = z.object({
  alt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  folderId: z.string().uuid().optional().nullable(),
});

export const mediaFolderSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().uuid().optional().nullable(),
});

export const mediaBulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export const mediaFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  folderId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  mimeType: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  view: z.enum(["grid", "list"]).default("grid"),
});

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;
export type MediaFilterInput = z.infer<typeof mediaFilterSchema>;
