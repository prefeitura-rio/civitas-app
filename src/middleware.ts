import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Allow requests to /auth/* paths and static files
  if (
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/_next')
  ) {
    return NextResponse.next()
  }

  // Redirect to /auth/sign-in if no token is found and the path is not /auth/*
  if (!token) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Apply the middleware to all routes except for those under /auth
  matcher: ['/((?!auth|_next|favicon.ico).*)'],
}
