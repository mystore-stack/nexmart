import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-api";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "general";
    const width = formData.get("width") as string;
    const height = formData.get("height") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Build transformation options
    const transformation: any[] = [];
    if (width && height) {
      transformation.push({ 
        width: parseInt(width), 
        height: parseInt(height), 
        crop: "fill", 
        quality: "auto" 
      });
    } else {
      transformation.push({ quality: "auto" });
    }

    // Upload to Cloudinary
    const result = await uploadImage(buffer, folder, {
      transformation,
    });

    return NextResponse.json({ 
      success: true, 
      url: result.url, 
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error: any) {
    console.error("[UPLOAD ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
