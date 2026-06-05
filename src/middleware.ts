import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  const token = request.cookies.get('token')?.value

  // Allow requests to /auth/*, /privacidade and static files
  if (
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/privacidade') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/_next')
  ) {
    return NextResponse.next()
  }

  // Allow fake token for E2E tests
  if (token === 'fake-test-token-for-e2e') {
    return NextResponse.next()
  }

  if (!session) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Apply the middleware to all routes except for those under /auth
  matcher: ['/((?!auth|privacidade|_next|favicon.ico).*)'],
}
