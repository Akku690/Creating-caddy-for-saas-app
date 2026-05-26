import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hostname = request.headers.get('host') || '';
  
  // Get tenant from hostname
  const parts = hostname.split('.');
  const subdomain = parts[0];

  // Main site routes
  if (hostname === 'plantgen.live' || hostname.includes('localhost')) {
    return NextResponse.next();
  }

  // Tenant-specific routing
  // Add tenant info to headers for use in components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-subdomain', subdomain);
  requestHeaders.set('x-tenant-hostname', hostname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
