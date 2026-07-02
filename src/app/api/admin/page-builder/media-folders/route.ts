import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, badRequest, notFound, conflict } from "@/lib/api-response";

// GET - Fetch all media folders
export async function GET(request: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");

    const where: any = {
      organizationId,
    };

    if (parentId) {
      where.parentId = parentId === "null" ? null : parentId;
    } else {
      where.parentId = null; // Get root folders by default
    }

    const folders = await prisma.mediaFolder.findMany({
      where,
      include: {
        children: true,
        _count: {
          select: { assets: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return ok(folders);
  } catch (error) {
    console.error("Error fetching media folders:", error);
    return serverError("Failed to fetch media folders");
  }
}

// POST - Create a new media folder
export async function POST(request: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const body = await request.json();
    const { name, parentId, slug } = body;

    // Validate required fields
    if (!name || !slug) {
      return badRequest("Missing required fields: name, slug");
    }

    // Build path
    let path = slug;
    if (parentId) {
      const parent = await prisma.mediaFolder.findFirst({
        where: {
          id: parentId,
          organizationId,
        },
      });

      if (!parent) {
        return notFound("Parent folder not found");
      }

      path = `${parent.path}/${slug}`;
    }

    // Check if path is unique
    const existing = await prisma.mediaFolder.findFirst({
      where: {
        organizationId,
        path,
      },
    });

    if (existing) {
      return conflict("A folder with this path already exists");
    }

    const folder = await prisma.mediaFolder.create({
      data: {
        organizationId,
        name,
        parentId: parentId || null,
        slug,
        path,
      },
    });

    return ok(folder, 201);
  } catch (error) {
    console.error("Error creating media folder:", error);
    return serverError("Failed to create media folder");
  }
}
