// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getSessionFromRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }
    const userId = session.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatar: true, phone: true, role: true, emailVerified: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ success: false, error: "Utilisateur introuvable" }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("/api/auth/me error", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
