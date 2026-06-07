import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuthFromRequest(req);
    if (authUser.role !== "ADMIN" && authUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};

    if (filter === "email") {
      where.channel = "EMAIL";
    } else if (filter === "sms") {
      where.channel = "SMS";
    } else if (filter === "failed") {
      where.status = "FAILED";
    }

    const [notifications, total] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          order: {
            select: {
              orderNumber: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.notificationLog.count({ where }),
    ]);

    return NextResponse.json({
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[ADMIN_NOTIFICATIONS] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
