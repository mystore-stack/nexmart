import { AuthError, requireAdmin, type ServerAuthSession } from "@/lib/auth-api";

export async function requireAiEngineerAccess(): Promise<ServerAuthSession> {
  const session = await requireAdmin();

  if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
    throw new AuthError("AI Engineer Dashboard requires administrator access", 403, "AI_ADMIN_REQUIRED");
  }

  return session;
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return {
      body: { success: false, error: error.message, code: error.code },
      status: error.statusCode,
    };
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  return { body: { success: false, error: message }, status: 500 };
}
