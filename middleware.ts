import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

function hasRole(roles: unknown, role: string) {
  return Array.isArray(roles) && roles.includes(role);
}

function isAuthorizedPath(pathname: string, roles: string[] = []) {
  if (hasRole(roles, 'Admin')) {
    return true; // Admin can access everything
  }

  const managerAllow = [
    /^\/$/,
    /^\/projects(\/|$)/,
    /^\/project(\/|$)/,
    /^\/users(\/|$)/,
    /^\/user-roles(\/|$)/,
    /^\/comments(\/|$)/,
  ];

  const developerAllow = [
    /^\/$/,
    /^\/projects(\/|$)/,
    /^\/project(\/|$)/,
    /^\/comments(\/|$)/,
  ];

  if (hasRole(roles, 'Manager') && managerAllow.some((rule) => rule.test(pathname))) {
    return true;
  }

  if (hasRole(roles, 'Developer') && developerAllow.some((rule) => rule.test(pathname))) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Allow access to login page and auth routes
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Redirect to login if no token
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const roles = (token as any)?.roles || [];
  if (!isAuthorizedPath(pathname, roles)) {
    return NextResponse.redirect(new URL('/?unauthorized=1', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
