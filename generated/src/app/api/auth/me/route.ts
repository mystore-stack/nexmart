// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jwt = await getCurrentUser();
    if (!jwt) return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: jwt.userId },
      select: { id: true, email: true, name: true, avatar: true, phone: true, role: true, emailVerified: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ success: false, error: "Utilisateur introuvable" }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
