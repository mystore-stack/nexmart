// src/app/api/upload/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-api";
import { uploadImage } from "@/lib/cloudinary";
import { ok, unauthorized, error, handleApiError } from "@/lib/api";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
const ALLOWED_FOLDERS = new Set([
  "nexmart/products",
  "nexmart/avatars",
  "nexmart/categories",
  "nexmart/reviews",
  "nexmart/homepage",
  "nexmart/hero-banners",
  "nexmart/hero-layers",
  "nexmart/offres-de-moments",
  "nexmart/promotions",
  "nexmart",
]);

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    console.log("[UPLOAD API] Starting upload request");
    const session = await requireAuth();
    console.log("[UPLOAD API] Auth session verified");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawFolder = (formData.get("folder") as string) || "nexmart/products";
    const folder = ALLOWED_FOLDERS.has(rawFolder) ? rawFolder : "nexmart/products";

    console.log("[UPLOAD API] File details:", {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      folder: folder,
    });

    if (!file) {
      console.error("[UPLOAD API] No file provided");
      return error("No file provided");
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error("[UPLOAD API] Invalid file type:", file.type);
      return error("Invalid file type. Only JPEG, PNG, WebP and AVIF are allowed.");
    }
    if (file.size > MAX_SIZE) {
      console.error("[UPLOAD API] File too large:", file.size);
      return error("File too large. Maximum size is 10MB.");
    }

    console.log("[UPLOAD API] Starting Cloudinary upload to folder:", folder);
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(buffer, folder, {
      transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
    });

    console.log("[UPLOAD API] Upload successful:", {
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
    });

    const response = ok({
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
    });

    // Add CORS headers to allow Cloudinary images
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  } catch (err) {
    console.error("[UPLOAD API] Upload error:", err);
    return handleApiError(err);
  }
}
