import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";
import { uploadImage, deleteImage as deleteCloudinaryImage } from "@/lib/cloudinary";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { z } from "zod";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
];

const uploadSchema = z.object({
  file: z.any(),
  folder: z.string().optional().default("media"),
  alt: z.string().optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  console.log("[UPLOAD] === UPLOAD REQUEST START ===");
  
  try {
    console.log("[UPLOAD] Authenticating user");
    const session = await requireAuth();
    console.log("[UPLOAD] User authenticated:", session.userId);
    
    console.log("[UPLOAD] Getting organization ID");
    const organizationId = await getDefaultOrganizationId();
    console.log("[UPLOAD] Organization ID:", organizationId);

    if (!organizationId) {
      console.error("[UPLOAD] No organization ID found");
      return NextResponse.json(
        { success: false, error: "No organization found. Please contact support." },
        { status: 400 }
      );
    }

    console.log("[UPLOAD] Parsing form data");
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "media";
    const alt = (formData.get("alt") as string) || null;
    const caption = (formData.get("caption") as string) || null;
    const tags = formData.get("tags") as string | null;

    console.log("[UPLOAD] File info:", {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      folder,
    });

    if (!file) {
      console.error("[UPLOAD] No file provided");
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error("[UPLOAD] Invalid file type:", file.type);
      return NextResponse.json(
        { success: false, error: `Invalid file type. Only ${ALLOWED_TYPES.join(", ")} are allowed.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      console.error("[UPLOAD] File too large:", file.size);
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB.` },
        { status: 413 }
      );
    }

    console.log("[UPLOAD] Converting file to buffer");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log("[UPLOAD] Buffer created, size:", buffer.length);

    // Check Cloudinary environment variables
    console.log("[UPLOAD] Checking Cloudinary configuration");
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.error("[UPLOAD] Missing CLOUDINARY_CLOUD_NAME");
      return NextResponse.json(
        { success: false, error: "Cloudinary configuration missing: CLOUDINARY_CLOUD_NAME" },
        { status: 500 }
      );
    }
    if (!process.env.CLOUDINARY_API_KEY) {
      console.error("[UPLOAD] Missing CLOUDINARY_API_KEY");
      return NextResponse.json(
        { success: false, error: "Cloudinary configuration missing: CLOUDINARY_API_KEY" },
        { status: 500 }
      );
    }
    if (!process.env.CLOUDINARY_API_SECRET) {
      console.error("[UPLOAD] Missing CLOUDINARY_API_SECRET");
      return NextResponse.json(
        { success: false, error: "Cloudinary configuration missing: CLOUDINARY_API_SECRET" },
        { status: 500 }
      );
    }
    console.log("[UPLOAD] Cloudinary configuration OK");

    console.log("[UPLOAD] Uploading to Cloudinary, folder:", folder);
    const uploadResult = await uploadImage(buffer, folder, {
      public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`,
    });
    console.log("[UPLOAD] Cloudinary upload completed:", uploadResult.publicId);

    console.log("[UPLOAD] Saving to database");
    const media = await prisma.media.create({
      data: {
        filename: uploadResult.publicId,
        originalName: file.name,
        url: uploadResult.url,
        secureUrl: uploadResult.url,
        publicId: uploadResult.publicId,
        mimeType: file.type,
        size: uploadResult.bytes,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        resourceType: "image",
        folder,
        alt,
        caption,
        tags: tags ? JSON.parse(tags) : [],
        uploadedBy: session.userId,
        organizationId,
      },
    });
    console.log("[UPLOAD] Database saved successfully:", media.id);

    console.log("[UPLOAD] === UPLOAD REQUEST SUCCESS ===");
    return NextResponse.json({
      success: true,
      media: {
        id: media.id,
        filename: media.filename,
        originalName: media.originalName,
        url: media.url,
        secureUrl: media.secureUrl,
        publicId: media.publicId,
        mimeType: media.mimeType,
        size: media.size,
        width: media.width,
        height: media.height,
        format: media.format,
        folder: media.folder,
        alt: media.alt,
        caption: media.caption,
        tags: media.tags,
        createdAt: media.createdAt,
      },
    });
  } catch (error) {
    console.error("[UPLOAD] === UPLOAD REQUEST ERROR ===");
    console.error("[UPLOAD] Error:", error);
    console.error("[UPLOAD] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[UPLOAD] Stack trace:", error instanceof Error ? error.stack : "No stack trace");
    
    // Determine specific error type
    let errorMessage = "Failed to upload media";
    if (error instanceof Error) {
      if (error.message.includes("Cloudinary")) {
        errorMessage = "Cloudinary error: " + error.message;
      } else if (error.message.includes("credentials") || error.message.includes("authentication")) {
        errorMessage = "Cloudinary authentication failed. Check API credentials.";
      } else if (error.message.includes("network") || error.message.includes("ECONNREFUSED")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Upload timeout. Please try again.";
      } else if (error.message.includes("organization")) {
        errorMessage = "Organization error: " + error.message;
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
