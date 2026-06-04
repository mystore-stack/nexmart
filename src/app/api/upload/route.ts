// src/app/api/upload/route.ts
import { NextRequest } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { ok, unauthorized, error, handleApiError } from "@/lib/api";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
const ALLOWED_FOLDERS = new Set([
  "nexmart/products",
  "nexmart/avatars",
  "nexmart/categories",
  "nexmart/reviews",
]);

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const payload = await getAuthFromRequest(req);
    if (!payload) return unauthorized();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawFolder = (formData.get("folder") as string) || "nexmart/products";
    const folder = ALLOWED_FOLDERS.has(rawFolder) ? rawFolder : "nexmart/products";

    if (!file) return error("No file provided");
    if (!ALLOWED_TYPES.includes(file.type)) {
      return error("Invalid file type. Only JPEG, PNG, WebP and AVIF are allowed.");
    }
    if (file.size > MAX_SIZE) {
      return error("File too large. Maximum size is 10MB.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(buffer, folder, {
      transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
    });

    return ok({
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
