import { notifyNewUser } from "@/lib/notifications/telegram";
// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/api";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/email";
import { initializeWelcomeSeries } from "@/lib/automation/welcome-series";
import { getDefaultOrganizationId } from "@/lib/tenant";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = await rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: "Trop de tentatives. Réessayez plus tard." },
        { status: 429 }
      );
    }

    const { name, email, password } = schema.parse(await req.json());

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ success: false, error: "Email déjà utilisé" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    // Step 1: Create user
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, email: true, name: true, role: true, avatar: true },
    });

    // Step 2: Get or create default organization
    let organizationId: string;
    try {
      organizationId = await getDefaultOrganizationId();
      console.log('[REGISTRATION] Using existing default organization:', organizationId);
    } catch {
      // Create default organization if it doesn't exist
      console.log('[REGISTRATION] Creating default organization');
      const organization = await prisma.organization.create({
        data: {
          name: 'NexMart Default',
          slug: 'nexmart',
          ownerId: user.id,
          status: 'ACTIVE',
        },
      });
      organizationId = organization.id;
      console.log('[REGISTRATION] Created default organization:', organizationId);
    }

    // Step 3: Create membership for user
    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: organizationId,
        role: 'MEMBER',
      },
    });
    console.log('[REGISTRATION] Created membership:', membership.id);

    // Step 4: Initialize welcome email series with correct organizationId
    initializeWelcomeSeries(user.id, organizationId).catch((error) => {
      console.error('[Welcome Series Initialization Error]:', error);
    });

    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      organizationId: organizationId,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };

    // Send welcome email asynchronously (non-blocking)
    sendWelcomeEmail(user.email, user.name, user.id).catch((error) => {
      console.error('[Welcome Email Error]:', error);
    });

    return NextResponse.json(
      {
        success: true,
        user: userPayload,
        data: { user: userPayload },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors }, { status: 422 });
    }
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
