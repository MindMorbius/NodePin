import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const log = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

async function unauthorized(request: NextRequest, messageKey: string) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: messageKey }, { status: 401 });
  }
  
  const url = new URL('/', request.url);
  url.searchParams.set('auth_error', messageKey);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const authPaths = [
    '/admin',
    '/api/admin'
  ];

  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPath) {
    log('[Middleware] Protected path accessed:', request.nextUrl.pathname);
    
    const session = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    log('[Middleware] Session data:', session);
    
    if (!session?.accessToken) {
      log('[Middleware] No access token found in session');
      return unauthorized(request, 'notification.pleaseLogin');
    }

    const protocol = request.nextUrl.protocol;
    const host = request.headers.get('host');
    const apiUrl = `${protocol}//${host}/api/auth/tryCatch`;
    log('[Middleware] Validating token at:', apiUrl);

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: session.accessToken })
    });

    const data = await res.json();
    log('[Middleware] Token validation response:', data);

    switch (data.status) {
      case 200:
        log('[Middleware] Authentication successful. User ID:', data.discourse_users_id);
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', data.discourse_users_id);
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          }
        });

      case 401:
        log('[Middleware] Invalid token');
        return unauthorized(request, 'notification.invalidSession');
      case 403:
        log('[Middleware] Token expired');
        return unauthorized(request, 'notification.sessionExpired');
      case 404:
        log('[Middleware] User not found');
        return unauthorized(request, 'notification.userNotFound');
      default:
        log('[Middleware] Unknown error:', data.status);
        return unauthorized(request, 'notification.authFailed');
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
};