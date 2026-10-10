// src/app/api/auth/token/route.ts
// Mobile authentication endpoint - returns JWT token for mobile apps
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/api";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = await rateLimit(`mobile-login:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: "Trop de tentatives. Réessayez plus tard." },
        { status: 429 }
      );
    }

    const { email, password } = schema.parse(await req.json());
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        avatar: true,
        emailVerified: true,
        phone: true,
      },
    });

    if (!user?.password) {
      return NextResponse.json(
        { success: false, error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Get organizationId for user
    const { getOrganizationIdForUser } = await import("@/lib/tenant");
    const organizationId = await getOrganizationIdForUser({ userId: user.id });

    // Create JWT token for mobile using jose
    const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("[MOBILE AUTH] JWT_SECRET not configured");
      return NextResponse.json(
        { success: false, error: "Configuration server incorrecte" },
        { status: 500 }
      );
    }

    const secret = new TextEncoder().encode(jwtSecret);
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      emailVerified: user.emailVerified,
      organizationId,
    };

    return NextResponse.json(
      {
        success: true,
        token,
        user: userPayload,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors },
        { status: 422 }
      );
    }
    console.error("[MOBILE AUTH] Error:", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
