/**
 * @jest-environment node
 *
 * session-touch must refresh before /users/me. Without refresh, an expired
 * access token clears a still-valid remember-me session.
 */
import { NextRequest } from 'next/server'

import { POST } from '@/app/api/auth/session-touch/route'
import { buildSessionFromTokenResponse, serializeSession } from '@/auth/session'

describe('POST /api/auth/session-touch', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-06-01T12:00:00.000Z'))
    process.env.APP_URL = 'http://localhost:3000'
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  function makeRequest(sessionCookie: string) {
    return new NextRequest('http://localhost:3000/api/auth/session-touch', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000',
        host: 'localhost:3000',
        cookie: `session=${sessionCookie}`,
      },
    })
  }

  it('returns 200 and refreshes when access token is expired but remember-me is valid', async () => {
    const session = buildSessionFromTokenResponse(
      {
        access_token: 'old-token',
        expires_in: 10,
        session_id: 'session-1',
      },
      { username: 'user', password: 'pass' },
      true,
    )
    const cookie = serializeSession(session).value

    jest.setSystemTime(Date.now() + 20_000)

    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (
        String(url).includes('/auth/token') ||
        String(url).includes('token')
      ) {
        return {
          ok: true,
          json: async () => ({
            access_token: 'new-token',
            expires_in: 3600,
            session_id: 'session-2',
          }),
        }
      }

      // /users/me
      return {
        ok: true,
        json: async () => ({ id: 'user' }),
      }
    }) as unknown as typeof fetch

    const response = await POST(makeRequest(cookie))
    const body = (await response.json()) as {
      authenticated: boolean
      refreshed: boolean
    }

    expect(response.status).toBe(200)
    expect(body).toEqual({ authenticated: true, refreshed: true })

    const setCookie = response.headers.getSetCookie?.() ?? []
    expect(
      setCookie.some(
        (c) => c.startsWith('session=') && !c.includes('Max-Age=0'),
      ),
    ).toBe(true)
    expect(setCookie.some((c) => c.startsWith('token=new-token'))).toBe(true)
  })

  it('returns 401 and clears cookies when upstream rejects the session', async () => {
    const session = buildSessionFromTokenResponse(
      {
        access_token: 'valid-token',
        expires_in: 3600,
        session_id: 'session-1',
      },
      { username: 'user', password: 'pass' },
      true,
    )
    const cookie = serializeSession(session).value

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ code: 'session_invalidated' }),
    }) as unknown as typeof fetch

    const response = await POST(makeRequest(cookie))
    const body = (await response.json()) as {
      authenticated: boolean
      code?: string
    }

    expect(response.status).toBe(401)
    expect(body.authenticated).toBe(false)
    expect(body.code).toBe('session_invalidated')

    const setCookie = response.headers.getSetCookie?.() ?? []
    expect(setCookie.some((c) => c.includes('Max-Age=0'))).toBe(true)
  })
})
