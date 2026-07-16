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
import { setForwardedClientIpHeaders } from '@/lib/request-client-ip'

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
const OMITTED_REQUEST_HEADERS = new Set([
  'host',
  'cookie',
  'content-length',
  'connection',
  'forwarded',
  'x-client-ip',
  'x-civitas-client-ip',
  'x-forwarded-for',
  'x-original-forwarded-for',
  'x-real-ip',
  'cf-connecting-ip',
  'true-client-ip',
])

const DEBUG_CLIENT_IP_REQUEST_HEADERS = [
  'cf-connecting-ip',
  'true-client-ip',
  'x-civitas-client-ip',
  'x-real-ip',
  'x-client-ip',
  'x-forwarded-for',
  'x-original-forwarded-for',
  'forwarded',
]

function setClientIpDebugResponseHeaders(
  response: NextResponse,
  upstreamHeaders: Headers,
  sourceHeaders: Headers,
) {
  const upstreamForwardedFor = upstreamHeaders.get('x-forwarded-for')
  const upstreamRealIp = upstreamHeaders.get('x-real-ip')
  const upstreamCivitasClientIp = upstreamHeaders.get('x-civitas-client-ip')

  if (upstreamCivitasClientIp) {
    response.headers.set(
      'x-debug-upstream-x-civitas-client-ip',
      upstreamCivitasClientIp,
    )
  }

  if (upstreamForwardedFor) {
    response.headers.set(
      'x-debug-upstream-x-forwarded-for',
      upstreamForwardedFor,
    )
  }

  if (upstreamRealIp) {
    response.headers.set('x-debug-upstream-x-real-ip', upstreamRealIp)
  }

  for (const header of DEBUG_CLIENT_IP_REQUEST_HEADERS) {
    const value = sourceHeaders.get(header)
    if (value) {
      response.headers.set(`x-debug-incoming-${header}`, value)
    }
  }
}

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
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

  const upstreamPath = params.path.join('/')
  const upstreamUrl = `${config.apiUrl}/${upstreamPath}${request.nextUrl.search}`

  const headers = new Headers()
  for (const [key, value] of request.headers.entries()) {
    const lowerKey = key.toLowerCase()
    if (OMITTED_REQUEST_HEADERS.has(lowerKey)) {
      continue
    }
    headers.set(key, value)
  }

  setForwardedClientIpHeaders(headers, request.headers)
  headers.set('Authorization', `Bearer ${result.session.accessToken}`)

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
    if (
      ['content-length', 'transfer-encoding', 'connection'].includes(lowerKey)
    ) {
      continue
    }
    response.headers.set(key, value)
  }

  setClientIpDebugResponseHeaders(response, headers, request.headers)

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
