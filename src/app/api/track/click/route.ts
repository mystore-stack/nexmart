// src/app/api/track/click/route.ts — Email Click Tracking
import { NextRequest, NextResponse } from 'next/server';
import { trackEmailClick } from '@/lib/automation/email-analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const emailLogId = req.nextUrl.searchParams.get('emailLogId');
    const linkUrl = req.nextUrl.searchParams.get('url');
    
    if (!emailLogId || !linkUrl) {
      return NextResponse.json({ error: 'Email log ID and URL required' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await trackEmailClick(emailLogId, linkUrl, ipAddress, userAgent);

    // Redirect to the original URL
    return NextResponse.redirect(linkUrl);
  } catch (error) {
    console.error('[Track Click Error]:', error);
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
  }
}
