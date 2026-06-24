import { z } from "zod";

export const navigationMenuSchema = z.object({
  name: z.string().min(1),
  location: z.enum(["HEADER", "FOOTER", "MOBILE", "SIDEBAR"]).default("HEADER"),
  isActive: z.boolean().default(true),
});

export const navigationMenuItemSchema = z.object({
  id: z.string().uuid().optional(),
  parentId: z.string().uuid().optional().nullable(),
  label: z.string().min(1),
  url: z.string().optional(),
  icon: z.string().optional(),
  target: z.enum(["_self", "_blank"]).default("_self"),
  isVisible: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
  badge: z.string().optional(),
});

export const navigationReorderSchema = z.object({
  menuId: z.string().uuid(),
  items: z.array(
    z.object({
      id: z.string().uuid(),
      displayOrder: z.number().int(),
      parentId: z.string().uuid().optional().nullable(),
    })
  ),
});

export type NavigationMenuInput = z.infer<typeof navigationMenuSchema>;
export type NavigationMenuItemInput = z.infer<typeof navigationMenuItemSchema>;
