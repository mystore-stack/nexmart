import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid file type. Only ${ALLOWED_TYPES.join(", ")} are allowed.` 
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB.` 
        },
        { status: 413 }
      );
    }

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.error("[UPLOAD] Missing CLOUDINARY_CLOUD_NAME environment variable");
      return NextResponse.json(
        { success: false, error: "Cloudinary configuration missing: CLOUDINARY_CLOUD_NAME" },
        { status: 500 }
      );
    }

    if (!process.env.CLOUDINARY_API_KEY) {
      console.error("[UPLOAD] Missing CLOUDINARY_API_KEY environment variable");
      return NextResponse.json(
        { success: false, error: "Cloudinary configuration missing: CLOUDINARY_API_KEY" },
        { status: 500 }
      );
    }

    if (!process.env.CLOUDINARY_API_SECRET) {
      console.error("[UPLOAD] Missing CLOUDINARY_API_SECRET environment variable");
      return NextResponse.json(
        { success: false, error: "Cloudinary configuration missing: CLOUDINARY_API_SECRET" },
        { status: 500 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await uploadImage(buffer, "nexmart/uploads", {
      public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      width: uploadResult.width,
      height: uploadResult.height,
    });

  } catch (error) {
    // Log server-side error only
    console.error("[UPLOAD] Error:", error);
    
    // Return generic error to client
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to upload image" 
      },
      { status: 500 }
    );
  }
}
