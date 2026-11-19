/**
 * @jest-environment node
 *
 * Desativar um usuário pelo BFF principal limpa o cache de permissões de tela: a próxima chamada ao BFF-IV volta a
 * consultar o civitas-api e o usuário desativado perde o acesso na hora, sem esperar o cache expirar.
 */
import { NextRequest } from 'next/server'

import { PATCH } from '@/app/api/bff/[...path]/route'
import { GET } from '@/app/api/bff-iv/[...path]/route'
import { buildSessionFromTokenResponse, serializeSession } from '@/auth/session'
import { invalidateScreenPermissionsCache } from '@/lib/bff/screen-permissions'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

const PERMISSIONS = {
  role: 'Analista',
  screens: [
    {
      screen_code: 'vehicle_intelligence',
      screen_label: 'Inteligência Veicular',
      can_view: true,
      allowed_actions: [],
    },
  ],
}

function sessionCookie() {
  const session = buildSessionFromTokenResponse(
    { access_token: 'token-1', expires_in: 3600, session_id: 'session-1' },
    { username: 'analista', password: 'pass' },
    false,
  )
  return serializeSession(session).value
}

function request(url: string, method = 'GET') {
  return new NextRequest(url, {
    method,
    headers: {
      host: 'localhost:3000',
      origin: 'http://localhost:3000',
      cookie: `session=${sessionCookie()}`,
    },
  })
}

const getIv = () =>
  GET(request('http://localhost:3000/api/bff-iv/api/veiculos/v1/dashboard'))

function mockFetch(apiStatus: number) {
  const mock = jest.fn(async (url: string | URL) => {
    if (String(url).includes('module-screen-permissions'))
      return json(PERMISSIONS)
    if (String(url).includes('/users-roles/'))
      return json({ detail: 'x' }, apiStatus)
    return json({ ok: true })
  })
  global.fetch = mock as unknown as typeof fetch
  return mock
}

const permissionCalls = (mock: jest.Mock) =>
  mock.mock.calls.filter(([url]) =>
    String(url).includes('module-screen-permissions'),
  ).length

describe('desativação e cache de permissões de tela', () => {
  beforeEach(() => {
    process.env.APP_URL = 'http://localhost:3000'
    process.env.VEHICLE_INTELLIGENCE_API_URL = 'http://iv.internal'
    invalidateScreenPermissionsCache()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    delete process.env.VEHICLE_INTELLIGENCE_API_URL
  })

  it('volta a consultar as permissões depois de uma desativação bem-sucedida', async () => {
    const mock = mockFetch(200)
    await getIv()
    await getIv()
    expect(permissionCalls(mock)).toBe(1)

    const response = await PATCH(
      request(
        'http://localhost:3000/api/bff/users-roles/u2/deactivate',
        'PATCH',
      ),
    )
    expect(response.status).toBe(200)

    await getIv()
    expect(permissionCalls(mock)).toBe(2)
  })

  it('não guarda a resposta de uma consulta que começou antes da desativação', async () => {
    let releasePermissions: () => void = () => {}
    const mock = jest.fn(async (url: string | URL) => {
      if (String(url).includes('module-screen-permissions')) {
        if (mock.mock.calls.length === 1) {
          await new Promise<void>((resolve) => {
            releasePermissions = resolve
          })
        }
        return json(PERMISSIONS)
      }
      return json({ ok: true })
    })
    global.fetch = mock as unknown as typeof fetch

    const first = getIv()
    await new Promise((resolve) => setTimeout(resolve, 0))
    invalidateScreenPermissionsCache()
    releasePermissions()
    await first

    await getIv()
    expect(permissionCalls(mock)).toBe(2)
  })

  it('mantém o cache quando a desativação falha', async () => {
    const mock = mockFetch(409)
    await getIv()
    await PATCH(
      request(
        'http://localhost:3000/api/bff/users-roles/u2/deactivate',
        'PATCH',
      ),
    )
    await getIv()
    expect(permissionCalls(mock)).toBe(1)
  })

  it('mantém o cache em outras chamadas ao BFF', async () => {
    const mock = mockFetch(200)
    await getIv()
    await PATCH(
      request('http://localhost:3000/api/bff/users-roles/u2', 'PATCH'),
    )
    await getIv()
    expect(permissionCalls(mock)).toBe(1)
  })
})
