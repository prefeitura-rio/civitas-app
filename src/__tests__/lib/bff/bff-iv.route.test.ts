/**
 * @jest-environment node
 *
 * BFF do Inteligência Veicular: mesma sessão do BFF do civitas-api, mais a permissão da tela vehicle_intelligence.
 */
import { NextRequest } from 'next/server'

import { GET } from '@/app/api/bff-iv/[...path]/route'
import { buildSessionFromTokenResponse, serializeSession } from '@/auth/session'

const UPSTREAM = 'http://iv.internal'

function permissions(canView: boolean) {
  return {
    role: canView ? 'Analista' : 'Agente',
    screens: [
      {
        screen_code: 'vehicle_intelligence',
        screen_label: 'Inteligência Veicular',
        can_view: canView,
        allowed_actions: [],
      },
    ],
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function sessionCookie() {
  const session = buildSessionFromTokenResponse(
    { access_token: 'token-1', expires_in: 3600, session_id: 'session-1' },
    { username: 'analista', password: 'pass' },
    false,
  )
  return serializeSession(session).value
}

function makeRequest(path: string, cookie: string | null = sessionCookie()) {
  return new NextRequest(`http://localhost:3000/api/bff-iv${path}`, {
    method: 'GET',
    headers: {
      host: 'localhost:3000',
      ...(cookie ? { cookie: `session=${cookie}` } : {}),
    },
  })
}

/** fetch falso: permissões do civitas-api e respostas do serviço veicular. */
function mockFetch({
  canView = true,
  permissionsStatus = 200,
  upstream = () => json({ ok: true }),
}: {
  canView?: boolean
  permissionsStatus?: number
  upstream?: () => Response
} = {}) {
  const mock = jest.fn(async (url: string | URL) => {
    if (String(url).includes('module-screen-permissions')) {
      return permissionsStatus === 200
        ? json(permissions(canView))
        : json({ detail: 'erro' }, permissionsStatus)
    }
    return upstream()
  })
  global.fetch = mock as unknown as typeof fetch
  return mock
}

function upstreamCalls(mock: jest.Mock) {
  return mock.mock.calls.filter(
    ([url]) => !String(url).includes('module-screen-permissions'),
  )
}

function sessionWasCleared(response: Response) {
  return (response.headers.getSetCookie?.() ?? []).some((c) =>
    /^session=;/.test(c),
  )
}

describe('GET /api/bff-iv/[...path]', () => {
  beforeEach(() => {
    process.env.APP_URL = 'http://localhost:3000'
    process.env.VEHICLE_INTELLIGENCE_API_URL = UPSTREAM
  })

  afterEach(() => {
    jest.restoreAllMocks()
    delete process.env.VEHICLE_INTELLIGENCE_API_URL
  })

  it('returns 401 without a session', async () => {
    const mock = mockFetch()
    const response = await GET(makeRequest('/api/veiculos/v1/dashboard', null))
    expect(response.status).toBe(401)
    expect(upstreamCalls(mock)).toHaveLength(0)
  })

  it('returns 403 and never calls the service when the role lacks the screen', async () => {
    const mock = mockFetch({ canView: false })
    const response = await GET(makeRequest('/api/veiculos/v1/dashboard'))
    expect(response.status).toBe(403)
    expect(upstreamCalls(mock)).toHaveLength(0)
  })

  it('returns 403 when the permission lookup fails', async () => {
    const mock = mockFetch({ permissionsStatus: 500 })
    const response = await GET(makeRequest('/api/veiculos/v1/dashboard'))
    expect(response.status).toBe(403)
    expect(upstreamCalls(mock)).toHaveLength(0)
  })

  it('forwards to the service with the session token when allowed', async () => {
    const mock = mockFetch({ upstream: () => json({ total: 3 }) })
    const response = await GET(
      makeRequest('/api/veiculos/v1/dashboard?recorte=veiculos'),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ total: 3 })
    const [[url, init]] = upstreamCalls(mock) as [[string, RequestInit]]
    expect(url).toBe(`${UPSTREAM}/api/veiculos/v1/dashboard?recorte=veiculos`)
    const headers = init.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer token-1')
    expect(headers.get('X-Civitas-Session-Id')).toBe('session-1')
  })

  it('keeps the CIVITAS session when the service answers 401', async () => {
    mockFetch({ upstream: () => json({ detail: 'Token inválido' }, 401) })
    const response = await GET(makeRequest('/api/veiculos/v1/dashboard'))
    expect(response.status).toBe(401)
    expect(sessionWasCleared(response)).toBe(false)
    expect(
      (response.headers.getSetCookie?.() ?? []).some((c) =>
        /^session=[^;]+;/.test(c),
      ),
    ).toBe(true)
  })

  it('ends the CIVITAS session when civitas-api rejects it during the permission check', async () => {
    const mock = mockFetch({ permissionsStatus: 401 })
    const response = await GET(makeRequest('/api/veiculos/v1/dashboard'))
    expect(response.status).toBe(401)
    expect(sessionWasCleared(response)).toBe(true)
    expect(upstreamCalls(mock)).toHaveLength(0)
  })

  it('shares one permission lookup across parallel requests', async () => {
    const mock = mockFetch()
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        GET(makeRequest('/api/veiculos/v1/dashboard')),
      ),
    )
    expect(responses.map((r) => r.status)).toEqual([200, 200, 200, 200, 200])
    const permissionCalls = mock.mock.calls.filter(([url]) =>
      String(url).includes('module-screen-permissions'),
    )
    expect(permissionCalls).toHaveLength(1)
    expect(upstreamCalls(mock)).toHaveLength(5)
  })

  it('returns 503 when the service URL is not configured', async () => {
    delete process.env.VEHICLE_INTELLIGENCE_API_URL
    const mock = mockFetch()
    const response = await GET(makeRequest('/api/veiculos/v1/dashboard'))
    expect(response.status).toBe(503)
    expect(upstreamCalls(mock)).toHaveLength(0)
  })

  it('checks the permission again on every call, so a deactivation applies at once', async () => {
    // Sem cache entre chamadas: vale em qualquer instância do Next, não só na que recebeu a desativação.
    let deactivated = false
    global.fetch = jest.fn(async (url: string | URL) => {
      if (!String(url).includes('module-screen-permissions'))
        return json({ ok: true })
      return deactivated
        ? json({ code: 'user_deactivated' }, 403)
        : json(permissions(true))
    }) as unknown as typeof fetch

    expect((await GET(makeRequest('/api/veiculos/v1/dashboard'))).status).toBe(
      200,
    )
    deactivated = true
    const response = await GET(makeRequest('/api/veiculos/v1/dashboard'))

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
      code: 'user_deactivated',
    })
  })

  it('ends the session with user_deactivated when the user was deactivated', async () => {
    const upstream = jest.fn(() => json({ ok: true }))
    global.fetch = jest.fn(async (url: string | URL) =>
      String(url).includes('module-screen-permissions')
        ? json({ code: 'user_deactivated' }, 403)
        : upstream(),
    ) as unknown as typeof fetch

    const response = await GET(makeRequest('/api/veiculos/v1/dashboard'))

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
      code: 'user_deactivated',
    })
    expect(sessionWasCleared(response)).toBe(true)
    expect(upstream).not.toHaveBeenCalled()
  })

  it('keeps denying other permission failures as 403', async () => {
    mockFetch({ permissionsStatus: 403 })
    const response = await GET(makeRequest('/api/veiculos/v1/dashboard'))
    expect(response.status).toBe(403)
    expect(sessionWasCleared(response)).toBe(false)
  })

  it('marks only the 401s that end the CIVITAS session', async () => {
    const ended = (response: Response) =>
      response.headers.get('x-civitas-session-ended') === '1'

    // sem sessão: o próprio BFF encerra
    mockFetch()
    expect(ended(await GET(makeRequest('/api/veiculos/v1/x', null)))).toBe(true)

    // usuário desativado: o BFF encerra
    global.fetch = jest.fn(async (url: string | URL) =>
      String(url).includes('module-screen-permissions')
        ? json({ code: 'user_deactivated' }, 403)
        : json({ ok: true }),
    ) as unknown as typeof fetch
    expect(ended(await GET(makeRequest('/api/veiculos/v1/x')))).toBe(true)

    // 401 do serviço veicular: a sessão da CIVITAS continua, sem a marca
    mockFetch({ upstream: () => json({ detail: 'service' }, 401) })
    const fromService = await GET(makeRequest('/api/veiculos/v1/x'))
    expect(fromService.status).toBe(401)
    expect(ended(fromService)).toBe(false)
  })

  it('never forwards a session-ended mark sent by the service', async () => {
    mockFetch({
      upstream: () =>
        new Response('{}', {
          status: 401,
          headers: {
            'content-type': 'application/json',
            'x-civitas-session-ended': '1',
          },
        }),
    })
    const response = await GET(makeRequest('/api/veiculos/v1/x'))
    expect(response.headers.get('x-civitas-session-ended')).toBeNull()
    expect(sessionWasCleared(response)).toBe(false)
  })

  it.each(['/openapi.json', '/docs', '/redoc'])(
    'returns 404 for the service API docs (%s)',
    async (path) => {
      const mock = mockFetch()
      const response = await GET(makeRequest(path))
      expect(response.status).toBe(404)
      expect(mock).not.toHaveBeenCalled()
    },
  )
})
