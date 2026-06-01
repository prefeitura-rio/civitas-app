import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  const token = request.cookies.get('token')?.value
  const enablePrivacyPage =
    process.env.NEXT_PUBLIC_ENABLE_PRIVACY_PAGE?.toLowerCase() === 'true'

  if (request.nextUrl.pathname.startsWith('/privacidade')) {
    if (!enablePrivacyPage) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }
    return NextResponse.next()
  }

  // Allow requests to /auth/* paths and static files
  if (
    request.nextUrl.pathname.startsWith('/auth') ||
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
  matcher: ['/((?!auth|api/auth|_next|favicon.ico).*)'],
}
