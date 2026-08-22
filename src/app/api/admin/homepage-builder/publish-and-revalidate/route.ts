import { NextResponse } from 'next/server';

// Proxy route: call existing publish endpoint then trigger the revalidation helper.
// This avoids editing the original publish implementation and guarantees the
// homepage cache is invalidated after a successful publish.

export async function POST(req: Request) {
  try {
	const origin = new URL(req.url).origin;

	// Preserve JSON body
	const payload = await req.json().catch(() => null);

	// Forward minimal auth headers (cookie / authorization) if present
	const forwardHeaders: Record<string, string> = {};
	const auth = req.headers.get('authorization');
	const cookie = req.headers.get('cookie');
	if (auth) forwardHeaders['authorization'] = auth;
	if (cookie) forwardHeaders['cookie'] = cookie;
	forwardHeaders['content-type'] = 'application/json';

	// 1) Call the existing publish endpoint
	const publishRes = await fetch(`${origin}/api/admin/homepage-builder/publish`, {
	  method: 'POST',
	  headers: forwardHeaders,
	  body: payload ? JSON.stringify(payload) : undefined,
	});

	const publishJson = await publishRes.clone().json().catch(() => null);

	if (!publishRes.ok) {
	  return NextResponse.json({ ok: false, publish: publishJson, status: publishRes.status }, { status: 502 });
	}

	// 2) Trigger revalidation helper with retry/backoff
	async function retryFetch(url: string, options: any, attempts = 3, delay = 500) {
	  let lastErr: any = null;
	  for (let i = 0; i < attempts; i++) {
		try {
		  const r = await fetch(url, options);
		  if (!r.ok) throw new Error(`status:${r.status}`);
		  return r;
		} catch (e) {
		  lastErr = e;
		  // exponential backoff
		  await new Promise((res) => setTimeout(res, delay * Math.pow(2, i)));
		}
	  }
	  throw lastErr;
	}

	let revalJson = null;
	try {
	  const revalRes = await retryFetch(`${origin}/api/admin/homepage-builder/publish-with-revalidate`, {
		method: 'POST',
		headers: forwardHeaders,
	  }, 3, 300);

	  revalJson = await revalRes.clone().json().catch(() => null);
	  return NextResponse.json({ ok: true, publish: publishJson, revalidate: revalJson });
	} catch (revalErr) {
	  // Publish succeeded but revalidation failed after retries — surface both results
	  return NextResponse.json({ ok: true, publish: publishJson, revalidateError: String(revalErr) }, { status: 200 });
	}
  } catch (err: any) {
	return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
