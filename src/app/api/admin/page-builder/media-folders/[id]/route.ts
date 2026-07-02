import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, notFound, conflict, badRequest } from "@/lib/api-response";

// GET - Fetch a single media folder
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const folderId = params.id;

    const folder = await prisma.mediaFolder.findFirst({
      where: {
        id: folderId,
        organizationId,
      },
      include: {
        parent: true,
        children: true,
        assets: {
          take: 20,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!folder) {
      return notFound("Media folder not found");
    }

    return ok(folder);
  } catch (error) {
    console.error("Error fetching media folder:", error);
    return serverError("Failed to fetch media folder");
  }
}

// PUT - Update a media folder
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const folderId = params.id;
    const body = await request.json();
    const { name, slug, parentId } = body;

    // Verify folder belongs to organization
    const existing = await prisma.mediaFolder.findFirst({
      where: {
        id: folderId,
        organizationId,
      },
    });

    if (!existing) {
      return notFound("Media folder not found");
    }

    // Build new path if slug or parentId changed
    let path = existing.path;
    if (slug || parentId !== undefined) {
      const newSlug = slug || existing.slug;
      const newParentId = parentId !== undefined ? parentId : existing.parentId;

      if (newParentId) {
        const parent = await prisma.mediaFolder.findFirst({
          where: {
            id: newParentId,
            organizationId,
          },
        });

        if (!parent) {
          return notFound("Parent folder not found");
        }

        path = `${parent.path}/${newSlug}`;
      } else {
        path = newSlug;
      }

      // Check if new path conflicts
      const pathConflict = await prisma.mediaFolder.findFirst({
        where: {
          organizationId,
          path,
          id: { not: folderId },
        },
      });

      if (pathConflict) {
        return conflict("A folder with this path already exists");
      }
    }

    const folder = await prisma.mediaFolder.update({
      where: { id: folderId },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(path !== existing.path && { path }),
        ...(parentId !== undefined && { parentId }),
      },
    });

    return ok(folder);
  } catch (error) {
    console.error("Error updating media folder:", error);
    return serverError("Failed to update media folder");
  }
}

// DELETE - Delete a media folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const folderId = params.id;

    // Verify folder belongs to organization
    const existing = await prisma.mediaFolder.findFirst({
      where: {
        id: folderId,
        organizationId,
      },
      include: {
        children: true,
        assets: true,
      },
    });

    if (!existing) {
      return notFound("Media folder not found");
    }

    // Check if folder has children or assets
    if (existing.children.length > 0) {
      return badRequest("Cannot delete folder with subfolders. Please delete subfolders first.");
    }

    if (existing.assets.length > 0) {
      return badRequest("Cannot delete folder with assets. Please move or delete assets first.");
    }

    await prisma.mediaFolder.delete({
      where: { id: folderId },
    });

    return ok({ message: "Media folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting media folder:", error);
    return serverError("Failed to delete media folder");
  }
}
