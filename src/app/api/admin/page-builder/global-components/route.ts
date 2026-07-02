import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, badRequest, conflict } from "@/lib/api-response";

// GET - Fetch all global components
export async function GET(request: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const { searchParams } = new URL(request.url);
    const componentType = searchParams.get("componentType");
    const enabled = searchParams.get("enabled");

    const where: any = {
      organizationId,
    };

    if (componentType) {
      where.componentType = componentType;
    }

    if (enabled !== null) {
      where.enabled = enabled === "true";
    }

    const components = await prisma.globalComponent.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return ok(components);
  } catch (error) {
    console.error("Error fetching global components:", error);
    return serverError("Failed to fetch global components");
  }
}

// POST - Create a new global component
export async function POST(request: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const body = await request.json();
    const { name, slug, componentType, config, enabled = true, createdBy } = body;

    // Validate required fields
    if (!name || !slug || !componentType || !config) {
      return badRequest("Missing required fields: name, slug, componentType, config");
    }

    // Check if slug is unique
    const existing = await prisma.globalComponent.findFirst({
      where: {
        organizationId,
        slug,
      },
    });

    if (existing) {
      return conflict("A component with this slug already exists");
    }

    const component = await prisma.globalComponent.create({
      data: {
        organizationId,
        name,
        slug,
        componentType,
        config,
        enabled,
        createdBy,
      },
    });

    return ok(component, 201);
  } catch (error) {
    console.error("Error creating global component:", error);
    return serverError("Failed to create global component");
  }
}
