import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('pack_together_session');
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/signup'];
  
  // Check if the path is public
  const isPublicPath = publicPaths.includes(pathname);

  // If there's no session and the path is not public, redirect to login
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there's a session and trying to access login/signup, redirect to dashboard
  if (session && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 