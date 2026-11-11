import { NextRequest, NextResponse } from 'next/server'

import { isTrustedOrigin } from '@/auth/csrf'
import {
  clearSessionCookies,
  getSessionCookieName,
  serializeAccessToken,
  serializeSession,
  validateAndRefreshSession,
} from '@/auth/session'
import { setForwardedClientIpHeaders } from '@/lib/request-client-ip'

const ALLOWED_METHODS = new Set([
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
])

const MAX_UPSTREAM_REDIRECTS = 5
const PRESERVE_METHOD_REDIRECT_STATUSES = new Set([307, 308])
const NO_BODY_RESPONSE_STATUSES = new Set([204, 205, 304])

/** Campos da sessão que o proxy repassa ao upstream. */
export interface BffSession {
  accessToken: string
  sessionId: string
}

export interface ProxyHandlerOptions {
  /** Prefixo da rota do BFF, removido antes de montar a URL do upstream (ex.: `/api/bff`). */
  pathPrefix: string
  /** URL base do upstream; vazia → 503 (serviço não configurado neste ambiente). */
  getUpstreamBaseUrl: () => string
  /**
   * Checagem extra depois de validar a sessão (ex.: permissão de tela). Devolve uma resposta para recusar a chamada,
   * ou `null` para seguir.
   */
  authorize?: (session: BffSession) => Promise<NextResponse | null>
  /**
   * Limpa os cookies de sessão quando o upstream responde 401 (padrão: sim). Desligado para serviços além do
   * civitas-api: um 401 deles (ex.: configuração de OIDC errada) não pode derrubar o login do usuário.
   */
  clearSessionOnUpstreamUnauthorized?: boolean
  /** Rótulo dos logs (ex.: `bff`). */
  logLabel?: string
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function withSessionCookies(
  response: NextResponse,
  session: Parameters<typeof serializeSession>[0],
) {
  const sessionCookie = serializeSession(session)
  const accessTokenCookie = serializeAccessToken(session)
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

export function createProxyHandler({
  pathPrefix,
  getUpstreamBaseUrl,
  authorize,
  clearSessionOnUpstreamUnauthorized = true,
  logLabel = 'bff',
}: ProxyHandlerOptions) {
  const prefixPattern = new RegExp(`^${escapeRegExp(pathPrefix)}`)

  return async function handler(request: NextRequest) {
    if (!ALLOWED_METHODS.has(request.method)) {
      return NextResponse.json(
        { message: 'Method not allowed' },
        { status: 405 },
      )
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

    if (authorize) {
      const denied = await authorize(result.session)
      if (denied) {
        // A sessão continua válida (e pode ter sido renovada): os cookies seguem atualizados.
        return withSessionCookies(denied, result.session)
      }
    }

    const upstreamBaseUrl = getUpstreamBaseUrl().replace(/\/+$/, '')
    if (!upstreamBaseUrl) {
      console.error(`[${logLabel}] upstream URL is not configured`)
      return NextResponse.json(
        { message: 'Service unavailable: upstream is not configured' },
        { status: 503 },
      )
    }

    // Preserve trailing slash from the incoming BFF path
    const upstreamPath = request.nextUrl.pathname.replace(prefixPattern, '')
    const upstreamUrl = `${upstreamBaseUrl}${upstreamPath}${request.nextUrl.search}`

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
      // If the redirect is cross-origin (e.g. FastAPI trailing-slash redirect
      // generates an absolute URL with internal host/scheme that differs from
      // the upstream base URL), normalize it back to the upstream origin so the BFF
      // can follow it safely. True cross-app redirects (different path root)
      // are still caught by the HTML-document guard below.
      if (nextUpstreamUrl.origin !== upstreamOrigin) {
        const normalized = new URL(
          nextUpstreamUrl.pathname + nextUpstreamUrl.search,
          upstreamOrigin,
        )
        console.warn(
          `[${logLabel}] normalized cross-origin upstream redirect`,
          {
            from: currentUpstreamUrl,
            original: nextUpstreamUrl.toString(),
            normalized: normalized.toString(),
          },
        )
        currentUpstreamUrl = normalized.toString()
      } else {
        currentUpstreamUrl = nextUpstreamUrl.toString()
      }

      upstreamResponse = await fetchUpstream(currentUpstreamUrl)
    }

    const hasNoBody =
      request.method === 'HEAD' ||
      NO_BODY_RESPONSE_STATUSES.has(upstreamResponse.status)
    const responseBody = hasNoBody ? null : await upstreamResponse.arrayBuffer()

    const upstreamContentType =
      upstreamResponse.headers.get('content-type')?.toLowerCase() ?? ''
    const contentDisposition =
      upstreamResponse.headers.get('content-disposition')?.toLowerCase() ?? ''
    const isAttachment = contentDisposition.includes('attachment')
    // Block HTML *documents* (wrong upstream / Next shell). Allow legitimate
    // HTML file downloads that use Content-Disposition: attachment.
    const looksLikeHtmlDocument =
      !hasNoBody && upstreamContentType.includes('text/html') && !isAttachment

    if (looksLikeHtmlDocument) {
      console.error(`[${logLabel}] upstream returned HTML document`, {
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

    if (upstreamResponse.status === 401 && clearSessionOnUpstreamUnauthorized) {
      for (const cookie of clearSessionCookies()) {
        response.cookies.set(cookie.name, cookie.value, cookie.options)
      }

      return response
    }

    return withSessionCookies(response, result.session)
  }
}
