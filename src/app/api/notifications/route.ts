// src/app/api/notifications/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";
import { ok, unauthorized, handleApiError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notification.count({
        where: { userId: session.userId, read: false },
      }),
    ]);

    return ok({ notifications, unreadCount });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();

    // Mark all as read
    await prisma.notification.updateMany({
      where: { userId: session.userId, read: false },
      data: { read: true },
    });

    return ok({ message: "All notifications marked as read" });
  } catch (err) {
    return handleApiError(err);
  }
}
