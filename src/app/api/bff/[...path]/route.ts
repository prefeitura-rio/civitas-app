import { NextRequest, NextResponse } from 'next/server'

import { isTrustedOrigin } from '@/auth/csrf'
import {
  clearSessionCookies,
  getSessionCookieName,
  serializeAccessToken,
  serializeSession,
  validateAndRefreshSession,
} from '@/auth/session'
import { config } from '@/config'

const ALLOWED_METHODS = new Set([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
])

const MAX_UPSTREAM_REDIRECTS = 5
const PRESERVE_METHOD_REDIRECT_STATUSES = new Set([307, 308])

async function handler(request: NextRequest) {
  if (!ALLOWED_METHODS.has(request.method)) {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
  }

  if (
    request.method !== 'GET' &&
    request.method !== 'HEAD' &&
    !isTrustedOrigin(request)
  ) {
    return NextResponse.json(
      { message: 'CSRF validation failed' },
      { status: 403 },
    )
  }

  const sessionValue = request.cookies.get(getSessionCookieName())?.value
  const result = await validateAndRefreshSession(sessionValue, true, true)

  if (!result.session) {
    const response = NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 },
    )
    for (const cookie of clearSessionCookies()) {
      response.cookies.set(cookie.name, cookie.value, cookie.options)
    }

    return response
  }

  // Preserve trailing slash from the incoming BFF path
  const upstreamPath = request.nextUrl.pathname.replace(/^\/api\/bff/, '')
  const upstreamUrl = `${config.apiUrl}${upstreamPath}${request.nextUrl.search}`

  const headers = new Headers()
  for (const [key, value] of request.headers.entries()) {
    const lowerKey = key.toLowerCase()
    if (['host', 'cookie', 'content-length', 'connection'].includes(lowerKey)) {
      continue
    }
    headers.set(key, value)
  }

  headers.set('Authorization', `Bearer ${result.session.accessToken}`)
  // Node fetch auto-decompresses gzip; only advertise gzip so the API can
  // compress the BFF←API hop without leaving br/zstd encodings we can't strip cleanly.
  headers.set('Accept-Encoding', 'gzip')

  let body: BodyInit | undefined
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.arrayBuffer()
  }

  const fetchUpstream = (url: string) =>
    fetch(url, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
      redirect: 'manual',
    })

  let currentUpstreamUrl = upstreamUrl
  let upstreamResponse = await fetchUpstream(currentUpstreamUrl)

  for (
    let redirectCount = 0;
    redirectCount < MAX_UPSTREAM_REDIRECTS &&
    PRESERVE_METHOD_REDIRECT_STATUSES.has(upstreamResponse.status);
    redirectCount++
  ) {
    const location = upstreamResponse.headers.get('location')
    if (!location) {
      break
    }

    currentUpstreamUrl = new URL(location, currentUpstreamUrl).toString()
    upstreamResponse = await fetchUpstream(currentUpstreamUrl)
  }

  const responseBody = await upstreamResponse.arrayBuffer()

  const response = new NextResponse(responseBody, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
  })

  for (const [key, value] of upstreamResponse.headers.entries()) {
    const lowerKey = key.toLowerCase()
    // content-encoding must be stripped: fetch() already decompressed the body.
    // Forwarding it causes NS_ERROR_INVALID_CONTENT_ENCODING in the browser.
    if (
      [
        'content-length',
        'content-encoding',
        'transfer-encoding',
        'connection',
      ].includes(lowerKey)
    ) {
      continue
    }
    response.headers.set(key, value)
  }

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

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
}
