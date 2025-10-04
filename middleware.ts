import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/refresh',
    '/api/v1/auth/forgot-password',
    '/api/v1/auth/reset-password',
    '/api/health',
    '/api/v1/content/',
  ];

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for authorization header
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7); // Remove 'Bearer '

  try {
    const decoded = verifyAccessToken(token);

    // Add user info to request headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId.toString());
    requestHeaders.set('x-user-role', decoded.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};