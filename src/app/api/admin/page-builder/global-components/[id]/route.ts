import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, notFound, conflict } from "@/lib/api-response";

// GET - Fetch a single global component
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const componentId = params.id;

    const component = await prisma.globalComponent.findFirst({
      where: {
        id: componentId,
        organizationId,
      },
    });

    if (!component) {
      return notFound("Global component not found");
    }

    return ok(component);
  } catch (error) {
    console.error("Error fetching global component:", error);
    return serverError("Failed to fetch global component");
  }
}

// PUT - Update a global component
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const componentId = params.id;
    const body = await request.json();
    const { name, slug, componentType, config, enabled } = body;

    // Verify component belongs to organization
    const existing = await prisma.globalComponent.findFirst({
      where: {
        id: componentId,
        organizationId,
      },
    });

    if (!existing) {
      return notFound("Global component not found");
    }

    // Check if new slug conflicts with another component
    if (slug && slug !== existing.slug) {
      const slugConflict = await prisma.globalComponent.findFirst({
        where: {
          organizationId,
          slug,
          id: { not: componentId },
        },
      });

      if (slugConflict) {
        return conflict("A component with this slug already exists");
      }
    }

    const component = await prisma.globalComponent.update({
      where: { id: componentId },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(componentType && { componentType }),
        ...(config && { config }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    return ok(component);
  } catch (error) {
    console.error("Error updating global component:", error);
    return serverError("Failed to update global component");
  }
}

// DELETE - Delete a global component
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const componentId = params.id;

    // Verify component belongs to organization
    const existing = await prisma.globalComponent.findFirst({
      where: {
        id: componentId,
        organizationId,
      },
    });

    if (!existing) {
      return notFound("Global component not found");
    }

    await prisma.globalComponent.delete({
      where: { id: componentId },
    });

    return ok({ message: "Global component deleted successfully" });
  } catch (error) {
    console.error("Error deleting global component:", error);
    return serverError("Failed to delete global component");
  }
}
