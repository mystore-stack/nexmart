import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import { getDefaultOrganizationId } from "@/lib/tenant";

// GET - List all media assets
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const tags = searchParams.get("tags")?.split(",");
    const search = searchParams.get("search");

    const organizationId = await getDefaultOrganizationId();

    const where: any = { organizationId };
    
    if (category) {
      where.category = category;
    }
    
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }
    
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: "insensitive" } },
        { alt: { contains: search, mode: "insensitive" } },
      ];
    }

    const media = await prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, media });
  } catch (error: any) {
    console.error("[MEDIA GET ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// POST - Upload new media asset
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const alt = formData.get("alt") as string;
    const tags = formData.get("tags") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary (using existing upload API)
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    
    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/upload`, {
      method: "POST",
      body: uploadFormData,
    });
    
    const uploadData = await uploadResponse.json();
    
    if (!uploadData.success) {
      return NextResponse.json(
        { success: false, error: "Upload failed" },
        { status: 500 }
      );
    }

    const organizationId = await getDefaultOrganizationId();

    // Get image dimensions if it's an image
    let width: number | undefined;
    let height: number | undefined;
    
    if (file.type.startsWith("image/")) {
      const buffer = await file.arrayBuffer();
      const sharp = await import("sharp");
      const metadata = await sharp.default(Buffer.from(buffer)).metadata();
      width = metadata.width;
      height = metadata.height;
    }

    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        organizationId,
        filename: uploadData.filename || file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: uploadData.url,
        width,
        height,
        alt: alt || null,
        category: category || null,
        tags: tags ? tags.split(",").map(t => t.trim()) : [],
      },
    });

    return NextResponse.json({ success: true, media: mediaAsset });
  } catch (error: any) {
    console.error("[MEDIA POST ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to upload media" },
      { status: 500 }
    );
  }
}
