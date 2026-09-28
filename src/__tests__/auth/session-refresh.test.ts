import {
  buildSessionFromTokenResponse,
  serializeSession,
  validateAndRefreshSession,
} from '@/auth/session'

describe('validateAndRefreshSession', () => {
  const credentials = { username: 'user', password: 'pass' }

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-06-01T12:00:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  function sealedRememberMeSession(expiresInSeconds: number) {
    const session = buildSessionFromTokenResponse(
      {
        access_token: 'old-token',
        expires_in: expiresInSeconds,
        session_id: 'session-1',
      },
      credentials,
      true,
    )
    return serializeSession(session).value
  }

  it('refreshes an expired access token when remember-me session is still valid', async () => {
    const cookie = sealedRememberMeSession(10)

    // Token expired; idle/absolute still valid (long absolute = 7d in jest.setup).
    jest.setSystemTime(Date.now() + 20_000)

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'new-token',
        expires_in: 3600,
        session_id: 'session-2',
      }),
    }) as unknown as typeof fetch

    const result = await validateAndRefreshSession(cookie, true, true)

    expect(result.shouldClear).toBe(false)
    expect(result.refreshed).toBe(true)
    expect(result.session?.accessToken).toBe('new-token')
    expect(result.session?.sessionId).toBe('session-2')
    expect(result.session?.rememberMe).toBe(true)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('does not refresh when refreshIfNeeded is false (session-touch regression)', async () => {
    const cookie = sealedRememberMeSession(10)
    jest.setSystemTime(Date.now() + 20_000)

    global.fetch = jest.fn() as unknown as typeof fetch

    const result = await validateAndRefreshSession(cookie, true, false)

    expect(result.shouldClear).toBe(false)
    expect(result.refreshed).toBe(false)
    expect(result.session?.accessToken).toBe('old-token')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('clears the session when refresh is required but token refresh fails', async () => {
    const cookie = sealedRememberMeSession(10)
    jest.setSystemTime(Date.now() + 20_000)

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
    }) as unknown as typeof fetch

    const result = await validateAndRefreshSession(cookie, true, true)

    expect(result.session).toBeNull()
    expect(result.shouldClear).toBe(true)
    expect(result.refreshed).toBe(false)
  })
})
