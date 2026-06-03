import { NextResponse } from 'next/server'

import { isTrustedOrigin } from '@/auth/csrf'
import { clearSessionCookies } from '@/auth/session'

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json(
      { message: 'CSRF validation failed' },
      { status: 403 },
    )
  }

  const response = NextResponse.json({ success: true })

  for (const cookie of clearSessionCookies()) {
    response.cookies.set(cookie.name, cookie.value, cookie.options)
  }

  return response
}
