import { NextResponse } from "next/server";
import { getNavigationMenu } from "@/lib/cms/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const navigation = await getNavigationMenu("HEADER");
    return NextResponse.json(
      { success: true, data: navigation, timestamp: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch navigation" }, { status: 500 });
  }
}
