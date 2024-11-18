import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 需要认证的路径
  const authPaths = [
    '/admin',
    '/api/admin',
    '/api/urls',  // 保护完整订阅列表
    '/api/nodes'  // 保护节点详情
  ];

  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPath) {
    const authCookie = request.cookies.get('auth');
    
    if (!authCookie?.value) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/urls/:path*',
    '/api/nodes/:path*'
  ]
}; 