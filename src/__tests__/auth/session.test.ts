import { isSessionExpired } from '@/auth/session'

describe('session', () => {
  it('expires short session after 1 hour of idle time', () => {
    const baseTime = 1_700_000_000_000
    const session = {
      accessToken: 'token',
      sessionId: 'session-id',
      username: 'user',
      password: 'pass',
      accessTokenExpiresAt: baseTime + 3600_000,
      createdAt: baseTime,
      lastActivityAt: baseTime,
      rememberMe: false,
    }

    expect(isSessionExpired(session, baseTime + 60 * 60 * 1000 + 1)).toBe(true)
    expect(isSessionExpired(session, baseTime + 60 * 60 * 1000)).toBe(false)
  })

  it('expires remembered session after 7 days of absolute timeout', () => {
    const baseTime = 1_700_000_000_000
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    const session = {
      accessToken: 'token',
      sessionId: 'session-id',
      username: 'user',
      password: 'pass',
      accessTokenExpiresAt: baseTime + 3600_000,
      createdAt: baseTime,
      lastActivityAt: baseTime + sevenDaysMs - 1,
      rememberMe: true,
    }

    expect(isSessionExpired(session, baseTime + sevenDaysMs)).toBe(false)
    expect(isSessionExpired(session, baseTime + sevenDaysMs + 1)).toBe(true)
  })
})
