import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-api";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get folder from form data or default to hero-banners
    const folder = (formData.get("folder") as string) || "hero-banners";
    
    // Upload to Cloudinary without cropping - preserve original aspect ratio
    const result = await uploadImage(buffer, folder, {
      transformation: [
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });

    return NextResponse.json({ 
      success: true, 
      data: { 
        url: result.url, 
        publicId: result.publicId,
        width: result.width,
        height: result.height
      } 
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
