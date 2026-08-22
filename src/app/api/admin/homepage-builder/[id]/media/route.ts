import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-api";

// GET - Fetch media assets for a specific section
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !(session as any).user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sectionId = id;
    const type = searchParams.get("type") || "all"; // image, video, all

    // In a real implementation, this would query a MediaAsset table
    // For now, return mock data
    const mockMedia = [
      {
        id: "1",
        filename: "hero-banner.jpg",
        url: "/images/hero-banner.jpg",
        mimeType: "image/jpeg",
        size: 256000,
        width: 1920,
        height: 1080,
        type: "image",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        filename: "product-video.mp4",
        url: "/videos/product-video.mp4",
        mimeType: "video/mp4",
        size: 5120000,
        width: 1280,
        height: 720,
        type: "video",
        createdAt: new Date().toISOString(),
      },
    ];

    const filteredMedia = type === "all" 
      ? mockMedia 
      : mockMedia.filter((m) => m.type === type);

    return NextResponse.json({ media: filteredMedia });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Upload media for a specific section
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !(session as any).user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const sectionId = id;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // In a real implementation, this would:
    // 1. Upload to Cloudinary or similar service
    // 2. Store the media asset in the database
    // 3. Return the media asset details

    // Mock upload response
    const mediaAsset = {
      id: crypto.randomUUID(),
      filename: file.name,
      url: `/uploads/${file.name}`,
      mimeType: file.type,
      size: file.size,
      type: file.type.startsWith("video/") ? "video" : "image",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ media: mediaAsset });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
