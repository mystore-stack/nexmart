// src/app/api/notifications/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { ok, unauthorized, handleApiError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const payload = await getAuthFromRequest(req);
    if (!payload) return unauthorized();

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: payload.userId },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notification.count({
        where: { userId: payload.userId, read: false },
      }),
    ]);

    return ok({ notifications, unreadCount });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const payload = await getAuthFromRequest(req);
    if (!payload) return unauthorized();

    // Mark all as read
    await prisma.notification.updateMany({
      where: { userId: payload.userId, read: false },
      data: { read: true },
    });

    return ok({ message: "All notifications marked as read" });
  } catch (err) {
    return handleApiError(err);
  }
}
