import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authErrorResponse, requireAiEngineerAccess } from "@/lib/admin-ai/auth";
import { getEngineerConversation, listEngineerConversations, sendEngineerMessage } from "@/lib/admin-ai/engineer";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  conversationId: z.string().uuid().optional().nullable(),
  message: z.string().min(1).max(6000),
  context: z.unknown().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAiEngineerAccess();
    const conversationId = req.nextUrl.searchParams.get("conversationId");

    if (conversationId) {
      const conversation = await getEngineerConversation(session.organizationId, conversationId);
      return NextResponse.json({ success: true, conversation });
    }

    const conversations = await listEngineerConversations(session.organizationId);
    return NextResponse.json({ success: true, conversations });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAiEngineerAccess();
    const body = bodySchema.parse(await req.json());
    const result = await sendEngineerMessage({
      organizationId: session.organizationId,
      userId: session.userId,
      conversationId: body.conversationId || undefined,
      message: body.message,
      context: body.context,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
