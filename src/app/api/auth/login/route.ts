// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTokenPair, setAuthCookies } from "@/lib/auth";
import { rateLimit } from "@/lib/api";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = await rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: "Trop de tentatives. Réessayez dans 15 minutes." },
        { status: 429 }
      );
    }

    const { email, password } = schema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ success: false, error: "Identifiants invalides" }, { status: 401 });
    }

    const { accessToken, refreshToken } = await generateTokenPair(user);
    setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
