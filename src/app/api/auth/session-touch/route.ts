import { NextRequest, NextResponse } from 'next/server'

import { isTrustedOrigin } from '@/auth/csrf'
import {
  clearSessionCookies,
  getSessionCookieName,
  serializeAccessToken,
  serializeSession,
  validateAndRefreshSession,
} from '@/auth/session'

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json(
      { message: 'CSRF validation failed' },
      { status: 403 },
    )
  }

  const sessionValue = request.cookies.get(getSessionCookieName())?.value

  const result = await validateAndRefreshSession(sessionValue, true)

  if (!result.session) {
    const response = NextResponse.json(
      { authenticated: false },
      { status: 401 },
    )
    for (const cookie of clearSessionCookies()) {
      response.cookies.set(cookie.name, cookie.value, cookie.options)
    }

    return response
  }

  const response = NextResponse.json({
    authenticated: true,
    refreshed: result.refreshed,
  })

  const sessionCookie = serializeSession(result.session)
  const accessTokenCookie = serializeAccessToken(result.session)

  response.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.options,
  )
  response.cookies.set(
    accessTokenCookie.name,
    accessTokenCookie.value,
    accessTokenCookie.options,
  )

  return response
}
