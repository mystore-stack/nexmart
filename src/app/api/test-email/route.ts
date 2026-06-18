// src/app/api/test-email/route.ts — Test Resend Email
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { EmailType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to = 'admin@nexmart.ma' } = body;

    const result = await sendEmail({
      to,
      subject: 'Test Email from NexMart',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0F766E;">Test Email</h1>
          <p>This is a test email from the NexMart email automation system.</p>
          <p>If you received this email, the Resend integration is working correctly!</p>
          <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          </div>
        </div>
      `,
      type: EmailType.WELCOME,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[Test Email Error]:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
