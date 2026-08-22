import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Lightweight helper route: when called (POST) it triggers a revalidation for the
// homepage path ('/'). This can be invoked by the admin UI after publishing the
// homepage so the frontend shows the latest content immediately.

export async function POST(req: Request) {
  try {
	// Optionally, add auth/verification here (cookie, header, token)
	await revalidatePath('/');
	return NextResponse.json({ ok: true, revalidated: '/' });
  } catch (err: any) {
	return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
