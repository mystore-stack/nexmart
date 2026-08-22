import { NextResponse } from "next/server";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";

export async function GET() {
  try {
    const organizationId = await getOptionalDefaultOrganizationId();
    
    if (!organizationId) {
      return NextResponse.json(
        { error: "No default organization found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ organizationId });
  } catch (error) {
    console.error("Error getting default organization:", error);
    return NextResponse.json(
      { error: "Failed to get default organization" },
      { status: 500 }
    );
  }
}
