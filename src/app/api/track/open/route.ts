// src/app/api/track/open/route.ts — Email Open Tracking
import { NextRequest, NextResponse } from 'next/server';
import { trackEmailOpen } from '@/lib/automation/email-analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const emailLogId = req.nextUrl.searchParams.get('emailLogId');
    
    if (!emailLogId) {
      return NextResponse.json({ error: 'Email log ID required' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await trackEmailOpen(emailLogId, ipAddress, userAgent);

    // Return a transparent 1x1 pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[Track Open Error]:', error);
    return NextResponse.json({ error: 'Failed to track open' }, { status: 500 });
  }
}
