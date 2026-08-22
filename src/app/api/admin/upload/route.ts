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

    // Upload to Cloudinary
    const result = await uploadImage(buffer, "hero-banners", {
      transformation: [
        { width: 1920, height: 1080, crop: "fill", quality: "auto" },
      ],
    });

    return NextResponse.json({ success: true, url: result.url, publicId: result.publicId });
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
