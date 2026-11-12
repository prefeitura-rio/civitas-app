/**
 * @jest-environment node
 *
 * BFF do civitas-api depois da extração para createProxyHandler: o comportamento tem de ser o de antes.
 */
import { NextRequest } from 'next/server'

import { GET, POST } from '@/app/api/bff/[...path]/route'
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
})
