import { NextRequest, NextResponse } from "next/server";
import { testGeminiConnection, isGeminiConfigured } from "@/lib/ai/gemini";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const isConfigured = isGeminiConfigured();
    const connectionTest = await testGeminiConnection();
    
    return NextResponse.json({
      success: true,
      configured: isConfigured,
      ...connectionTest,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
