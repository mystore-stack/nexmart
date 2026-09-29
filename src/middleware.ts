import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Apply timeout for API routes to prevent long-running requests
  if (request.nextUrl.pathname.startsWith('/api')) {
    const response = NextResponse.next();
    
    // Set a timeout warning (actual timeout handled by Node.js/server)
    response.headers.set('X-Timeout-Warning', 'Requests exceeding 30s may be terminated');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
