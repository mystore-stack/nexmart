// src/app/api/auth/addresses/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";
import { ok, created, unauthorized, handleApiError } from "@/lib/api";

const addressSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(7).max(20),
  line1: z.string().min(5).max(100),
  line2: z.string().max(100).optional(),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  country: z.string().min(2).max(50),
  zip: z.string().min(3).max(12),
  isDefault: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    const addresses = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return ok(addresses);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("[ADDRESS POST] Starting address creation");

    const session = await requireAuth();
    console.log("[ADDRESS POST] Session retrieved:", {
      userId: session.userId,
      email: session.email,
      role: session.role,
      organizationId: session.organizationId,
    });

    // Validate session.userId exists
    if (!session.userId) {
      console.error("[ADDRESS POST] Session userId is missing");
      return Response.json(
        {
          success: false,
          error: "Session userId is missing",
          code: "MISSING_USER_ID",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    console.log("[ADDRESS POST] Request body:", body);

    const data = addressSchema.parse(body);
    console.log("[ADDRESS POST] Parsed Zod data:", data);

    // Verify user exists in database before creating address
    console.log("[ADDRESS POST] Verifying user exists in database:", session.userId);
    const userExists = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true },
    });

    if (!userExists) {
      console.error("[ADDRESS POST] User does not exist in database:", session.userId);
      return Response.json(
        {
          success: false,
          error: "User does not exist in database",
          code: "USER_NOT_FOUND",
          userId: session.userId,
        },
        { status: 400 }
      );
    }

    console.log("[ADDRESS POST] User verified in database");

    // If setting as default, unset other defaults
    if (data.isDefault) {
      console.log("[ADDRESS POST] Unsetting other default addresses for user:", session.userId);
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
    }

    const createPayload = { ...data, userId: session.userId };
    console.log("[ADDRESS POST] Prisma create payload:", createPayload);

    const address = await prisma.address.create({
      data: createPayload,
    });
    console.log("[ADDRESS POST] Address created successfully:", address.id);

    return created(address);
  } catch (err) {
    console.error("[ADDRESS POST ERROR]", err);

    // Check for specific Prisma errors
    if (err && typeof err === 'object') {
      const prismaError = err as any;
      if (prismaError.code === 'P2003') {
        console.error("[ADDRESS POST] Foreign key constraint violation:", prismaError.meta);
        return Response.json(
          {
            success: false,
            error: "Foreign key constraint violation - referenced user does not exist",
            code: "FOREIGN_KEY_VIOLATION",
            meta: prismaError.meta,
          },
          { status: 400 }
        );
      }
      if (prismaError.code === 'P2002') {
        console.error("[ADDRESS POST] Unique constraint violation:", prismaError.meta);
        return Response.json(
          {
            success: false,
            error: "Unique constraint violation",
            code: "UNIQUE_CONSTRAINT_VIOLATION",
            meta: prismaError.meta,
          },
          { status: 409 }
        );
      }
    }

    return Response.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
        code: err instanceof Error && (err as any).code ? (err as any).code : "INTERNAL_ERROR",
        stack:
          process.env.NODE_ENV === "development"
            ? err instanceof Error
              ? err.stack
              : null
            : undefined,
      },
      { status: 500 }
    );
  }
}
