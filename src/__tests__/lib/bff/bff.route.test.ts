/**
 * @jest-environment node
 *
 * BFF do civitas-api depois da extração para createProxyHandler: o comportamento tem de ser o de antes.
 */
import { NextRequest } from 'next/server'

import { GET, HEAD, POST } from '@/app/api/bff/[...path]/route'
import { buildSessionFromTokenResponse, serializeSession } from '@/auth/session'

jest.mock('@/config', () => {
  const actual = jest.requireActual('@/config')
  return {
    ...actual,
    config: { ...actual.config, apiUrl: 'http://api.internal' },
  }
})

function sessionCookie() {
  const session = buildSessionFromTokenResponse(
    { access_token: 'token-1', expires_in: 3600, session_id: 'session-1' },
    { username: 'user', password: 'pass' },
    false,
  )
  return serializeSession(session).value
}

function makeRequest(
  path: string,
  {
    method = 'GET',
    cookie = sessionCookie(),
    origin,
  }: { method?: string; cookie?: string | null; origin?: string } = {},
) {
  return new NextRequest(`http://localhost:3000/api/bff${path}`, {
    method,
    headers: {
      host: 'localhost:3000',
      ...(cookie ? { cookie: `session=${cookie}` } : {}),
      ...(origin ? { origin } : {}),
    },
  })
}

function mockUpstream(response: () => Response) {
  const mock = jest.fn(async () => response())
  global.fetch = mock as unknown as typeof fetch
  return mock
}

function setCookies(response: Response) {
  return response.headers.getSetCookie?.() ?? []
}

describe('/api/bff/[...path]', () => {
  beforeEach(() => {
    process.env.APP_URL = 'http://localhost:3000'
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('forwards to civitas-api with the session token and refreshes the cookies', async () => {
    const mock = mockUpstream(
      () =>
        new Response(JSON.stringify({ id: 1 }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    )
    const response = await GET(makeRequest('/users/me?full=true'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ id: 1 })
    const [[url, init]] = mock.mock.calls as unknown as [[string, RequestInit]]
    expect(url).toBe('http://api.internal/users/me?full=true')
    const headers = init.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer token-1')
    expect(headers.get('X-Civitas-Session-Id')).toBe('session-1')
    expect(setCookies(response).some((c) => /^session=[^;]+;/.test(c))).toBe(
      true,
    )
  })

  it('clears the session when civitas-api answers 401', async () => {
    mockUpstream(() => new Response('{}', { status: 401 }))
    const response = await GET(makeRequest('/users/me'))
    expect(response.status).toBe(401)
    expect(setCookies(response).some((c) => /^session=;/.test(c))).toBe(true)
  })

  it('clears the session when civitas-api answers 403 user_deactivated', async () => {
    mockUpstream(
      () =>
        new Response(JSON.stringify({ code: 'user_deactivated' }), {
          status: 403,
          headers: { 'content-type': 'application/json' },
        }),
    )
    const response = await GET(makeRequest('/users/me'))
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ code: 'user_deactivated' })
    expect(setCookies(response).some((c) => /^session=;/.test(c))).toBe(true)
  })

  it('keeps the session on other 403 answers', async () => {
    mockUpstream(
      () =>
        new Response(JSON.stringify({ detail: 'nope' }), {
          status: 403,
          headers: { 'content-type': 'application/json' },
        }),
    )
    const response = await GET(makeRequest('/users/me'))
    expect(response.status).toBe(403)
    expect(setCookies(response).some((c) => /^session=;/.test(c))).toBe(false)
  })

  it('forwards user_deactivated when the token refresh is refused', async () => {
    const expired = buildSessionFromTokenResponse(
      { access_token: 'token-1', expires_in: 1, session_id: 'session-1' },
      { username: 'user', password: 'pass' },
      true,
    )
    const cookie = serializeSession(expired).value
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(expired.accessTokenExpiresAt + 60_000)
    const mock = mockUpstream(
      () =>
        new Response(JSON.stringify({ code: 'user_deactivated' }), {
          status: 403,
          headers: { 'content-type': 'application/json' },
        }),
    )

    const response = await GET(makeRequest('/users/me', { cookie }))

    expect(mock).toHaveBeenCalledTimes(1) // só a renovação; o upstream nem é chamado
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
      code: 'user_deactivated',
    })
    expect(setCookies(response).some((c) => /^session=;/.test(c))).toBe(true)
  })

  it('marks the 401s that end the session', async () => {
    mockUpstream(() => new Response('{}', { status: 401 }))
    const fromApi = await GET(makeRequest('/users/me'))
    expect(fromApi.headers.get('x-civitas-session-ended')).toBe('1')

    const noSession = await GET(makeRequest('/users/me', { cookie: null }))
    expect(noSession.headers.get('x-civitas-session-ended')).toBe('1')
  })

  it('returns 401 without a session', async () => {
    const mock = mockUpstream(() => new Response('{}'))
    const response = await GET(makeRequest('/users/me', { cookie: null }))
    expect(response.status).toBe(401)
    expect(mock).not.toHaveBeenCalled()
  })

  it('blocks HTML documents from upstream but allows HTML attachments', async () => {
    mockUpstream(
      () =>
        new Response('<html></html>', {
          headers: { 'content-type': 'text/html' },
        }),
    )
    expect((await GET(makeRequest('/users/me'))).status).toBe(502)

    mockUpstream(
      () =>
        new Response('<html></html>', {
          headers: {
            'content-type': 'text/html',
            'content-disposition': 'attachment; filename="r.html"',
          },
        }),
    )
    expect((await GET(makeRequest('/reports/1'))).status).toBe(200)
  })

  it('rejects state-changing requests from untrusted origins', async () => {
    const mock = mockUpstream(() => new Response('{}'))
    const response = await POST(
      makeRequest('/tickets', { method: 'POST', origin: 'http://evil.test' }),
    )
    expect(response.status).toBe(403)
    expect(mock).not.toHaveBeenCalled()
  })

  describe('API docs (Swagger)', () => {
    it.each([
      '/openapi.json',
      '/docs',
      '/redoc',
      '/docs/oauth2-redirect',
      '/openapi.json/',
      '//openapi.json',
      '/%6Fpenapi.json',
      '/OpenAPI.json',
      '/docs%2Foauth2-redirect',
    ])('returns 404 for %s without calling the upstream', async (path) => {
      const mock = mockUpstream(() => new Response('{}'))
      const response = await GET(makeRequest(path))
      expect(response.status).toBe(404)
      expect(mock).not.toHaveBeenCalled()
    })

    it('returns 404 for HEAD and without a session', async () => {
      const mock = mockUpstream(() => new Response('{}'))
      expect(
        (await HEAD(makeRequest('/openapi.json', { method: 'HEAD' }))).status,
      ).toBe(404)
      expect((await GET(makeRequest('/docs', { cookie: null }))).status).toBe(
        404,
      )
      expect(mock).not.toHaveBeenCalled()
    })

    it('does not follow an upstream redirect to the docs', async () => {
      const mock = mockUpstream(
        () =>
          new Response(null, {
            status: 307,
            headers: { location: 'http://api.internal/openapi.json' },
          }),
      )
      const response = await GET(makeRequest('/users/me/'))
      expect(response.status).toBe(404)
      expect(mock).toHaveBeenCalledTimes(1)
    })

    it('keeps forwarding routes with similar names', async () => {
      const mock = mockUpstream(
        () =>
          new Response('{}', {
            headers: { 'content-type': 'application/json' },
          }),
      )
      for (const path of ['/documents', '/docs-history', '/reports/docs']) {
        expect((await GET(makeRequest(path))).status).toBe(200)
      }
      expect(mock).toHaveBeenCalledTimes(3)
    })
  })
})
