import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MobileAuthError, requireMobileAuth } from '@/lib/mobile-auth-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where: { userId: session.userId }, orderBy: { createdAt: 'desc' }, take: 30 }),
      prisma.notification.count({ where: { userId: session.userId, read: false } }),
    ]);
    return NextResponse.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load notifications';
    const status = error instanceof MobileAuthError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);
    await prisma.notification.updateMany({ where: { userId: session.userId, read: false }, data: { read: true } });
    return NextResponse.json({ success: true, data: { updated: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update notifications';
    const status = error instanceof MobileAuthError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}