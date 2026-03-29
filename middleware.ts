import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, api routes, and internal next paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    const isDocker = process.env.DOCKER_CONTAINER === 'true';
    const backendUrl = process.env.BACKEND_URL || (isDocker ? 'http://backend:5000' : 'http://127.0.0.1:5000');
    
    // Add a 2 second timeout so the whole site doesn't hang if the check fails
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    // Check for redirect in the database via NestJS API
    const response = await fetch(`${backendUrl}/api/v1/redirects/check?source=${encodeURIComponent(pathname)}`, {
      // caching not supported in edge runtime middleware for fetch
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      if (text) {
        const redirect = JSON.parse(text);
        if (redirect && redirect.destination) {
          return NextResponse.redirect(new URL(redirect.destination, request.url), redirect.permanent ? 308 : 307);
        }
      }
    }
  } catch (error) {
    console.error('[Middleware] Redirect check failed:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
