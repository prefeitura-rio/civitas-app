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

  // Do not forward browser/Next headers (RSC, cookies, accept: text/html, etc.).
  // Those can confuse upstream or, on bad DNS, make a loop look like a document request.
  const headers = new Headers()
  headers.set('Authorization', `Bearer ${result.session.accessToken}`)
  headers.set('X-Civitas-Session-Id', result.session.sessionId)
  const accept = request.headers.get('accept')
  headers.set(
    'Accept',
    accept && !accept.includes('text/html') ? accept : 'application/json',
  )
  // Node fetch auto-decompresses gzip; only advertise gzip so the API can
  // compress the BFF←API hop without leaving br/zstd encodings we can't strip cleanly.
  headers.set('Accept-Encoding', 'gzip')
  const contentType = request.headers.get('content-type')
  if (contentType) {
    headers.set('Content-Type', contentType)
  }
  // Required for GCS resumable uploads: API passes Origin into
  // create_resumable_upload_session so PUT responses include ACAO for the browser.
  const origin = request.headers.get('origin')
  if (origin) {
    headers.set('Origin', origin)
  }
  setForwardedClientIpHeaders(headers, request.headers)

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

  const upstreamOrigin = new URL(upstreamUrl).origin
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

    const nextUpstreamUrl = new URL(location, currentUpstreamUrl)
    // Refuse cross-origin redirects (e.g. API → app HTML) which break the BFF.
    if (nextUpstreamUrl.origin !== upstreamOrigin) {
      console.error('[bff] refused cross-origin upstream redirect', {
        from: currentUpstreamUrl,
        to: nextUpstreamUrl.toString(),
      })
      return NextResponse.json(
        { message: 'Bad gateway: upstream redirected off API origin' },
        { status: 502 },
      )
    }

    currentUpstreamUrl = nextUpstreamUrl.toString()
    upstreamResponse = await fetchUpstream(currentUpstreamUrl)
  }

  const responseBody = await upstreamResponse.arrayBuffer()
  const upstreamContentType =
    upstreamResponse.headers.get('content-type')?.toLowerCase() ?? ''
  const contentDisposition =
    upstreamResponse.headers.get('content-disposition')?.toLowerCase() ?? ''
  const isAttachment = contentDisposition.includes('attachment')
  // Block HTML *documents* (wrong upstream / Next shell). Allow legitimate
  // HTML file downloads that use Content-Disposition: attachment.
  const looksLikeHtmlDocument =
    upstreamContentType.includes('text/html') && !isAttachment

  if (looksLikeHtmlDocument) {
    console.error('[bff] upstream returned HTML document', {
      upstreamUrl: currentUpstreamUrl,
      status: upstreamResponse.status,
      contentType: upstreamContentType,
    })
    return NextResponse.json(
      {
        message: 'Bad gateway: upstream returned HTML instead of API data',
        upstream: currentUpstreamUrl,
      },
      { status: 502 },
    )
  }

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

  if (upstreamResponse.status === 401) {
    for (const cookie of clearSessionCookies()) {
      response.cookies.set(cookie.name, cookie.value, cookie.options)
    }

    return response
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
