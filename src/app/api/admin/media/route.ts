import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { deleteImage as deleteCloudinaryImage } from "@/lib/cloudinary";

// GET - List all media assets
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const organizationId = await getDefaultOrganizationId();

    const searchParams = req.nextUrl.searchParams;
    const folder = searchParams.get("folder");
    const mimeType = searchParams.get("mimeType");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");

    const where: any = { organizationId };
    
    if (folder) {
      where.folder = folder;
    }
    
    if (mimeType) {
      where.mimeType = mimeType;
    }
    
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: "insensitive" } },
        { alt: { contains: search, mode: "insensitive" } },
        { caption: { contains: search, mode: "insensitive" } },
      ];
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({ 
      success: true, 
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error("[MEDIA GET ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// DELETE - Delete media asset
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth();
    const organizationId = await getDefaultOrganizationId();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Media ID is required" },
        { status: 400 }
      );
    }

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json(
        { success: false, error: "Media not found" },
        { status: 404 }
      );
    }

    if (media.organizationId !== organizationId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete from Cloudinary
    if (media.publicId) {
      await deleteCloudinaryImage(media.publicId);
    }

    // Delete from database
    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[MEDIA DELETE ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete media" },
      { status: 500 }
    );
  }
}

// PATCH - Update media asset metadata
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const organizationId = await getDefaultOrganizationId();

    const body = await req.json();
    const { id, alt, caption, tags, folder } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Media ID is required" },
        { status: 400 }
      );
    }

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json(
        { success: false, error: "Media not found" },
        { status: 404 }
      );
    }

    if (media.organizationId !== organizationId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const updatedMedia = await prisma.media.update({
      where: { id },
      data: {
        ...(alt !== undefined && { alt }),
        ...(caption !== undefined && { caption }),
        ...(tags !== undefined && { tags }),
        ...(folder !== undefined && { folder }),
      },
    });

    return NextResponse.json({ success: true, media: updatedMedia });
  } catch (error: any) {
    console.error("[MEDIA PATCH ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update media" },
      { status: 500 }
    );
  }
}
