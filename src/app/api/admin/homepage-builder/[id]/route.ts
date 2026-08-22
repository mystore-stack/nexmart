import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-api";
import { revalidatePath, revalidateTag } from "next/cache";

// PATCH - Update section
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { isEnabled, config, publishStatus, scheduledPublishAt, scheduledExpireAt, isLocked, customName, displayOrder } = body;

    const updateData: any = {};
    if (typeof isEnabled === "boolean") updateData.isEnabled = isEnabled;
    if (config) updateData.config = config;
    if (publishStatus) {
      updateData.publishStatus = publishStatus;
      if (publishStatus === "PUBLISHED") {
        updateData.publishedAt = new Date();
      }
    }
    if (scheduledPublishAt) updateData.scheduledPublishAt = new Date(scheduledPublishAt);
    if (scheduledExpireAt) updateData.scheduledExpireAt = new Date(scheduledExpireAt);
    if (typeof isLocked === "boolean") updateData.isLocked = isLocked;
    if (customName !== undefined) updateData.customName = customName;
    if (typeof displayOrder === "number") updateData.displayOrder = displayOrder;

    const section = await (prisma as any).homepageSection.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete section
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("DELETE request received");
  
  try {
    const { id } = await params;
    console.log("Deleting section with ID:", id);
    
    const session = await getSession();
    if (!session) {
      console.log("Unauthorized delete attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User authenticated:", session.userId);

    // Check if section exists
    const section = await (prisma as any).homepageSection.findUnique({
      where: { id },
    });

    console.log("Section found:", !!section);

    if (!section) {
      console.log("Section not found, returning 404");
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    console.log("Deleting section from database");
    // Delete the section
    await (prisma as any).homepageSection.delete({
      where: { id },
    });

    console.log("Section deleted successfully, revalidating cache");
    // Revalidate cache
    revalidatePath("/");
    revalidatePath("/admin/homepage-builder");
    revalidateTag("homepage");

    console.log("Returning success response");
    return NextResponse.json({ success: true, message: "Section deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting section:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    // Return detailed error information
    const errorMessage = error?.message || "Internal server error";
    const errorDetails = error?.code ? `Code: ${error.code}` : '';
    const errorStack = error?.stack ? `Stack: ${error.stack}` : '';
    
    const errorResponse = {
      error: errorMessage,
      details: errorDetails,
      stack: errorStack,
      timestamp: new Date().toISOString()
    };
    
    console.log("Returning error response:", errorResponse);
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
