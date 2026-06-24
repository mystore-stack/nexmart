// src/app/api/upload/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-api";
import { ok, error, handleApiError } from "@/lib/api";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
const ALLOWED_FOLDERS = new Set([
  "products",
  "avatars",
  "categories",
  "reviews",
]);

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawFolder = (formData.get("folder") as string) || "products";
    const folder = ALLOWED_FOLDERS.has(rawFolder) ? rawFolder : "products";

    if (!file) return error("No file provided");
    if (!ALLOWED_TYPES.includes(file.type)) {
      return error("Invalid file type. Only JPEG, PNG, WebP and AVIF are allowed.");
    }
    if (file.size > MAX_SIZE) {
      return error("File too large. Maximum size is 10MB.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${randomUUID()}${ext}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save file locally
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Return internal path (not public URL)
    const internalPath = `/uploads/${folder}/${filename}`;

    return ok({
      path: internalPath,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
