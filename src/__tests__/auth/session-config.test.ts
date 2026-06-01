import { getSessionPolicy } from '@/auth/session-config'
import { config } from '@/config'

describe('session-config', () => {
  it('returns short session policy when rememberMe is false', () => {
    expect(getSessionPolicy(false)).toEqual({
      idleTimeoutSeconds: config.authShortIdleTimeoutSeconds,
      absoluteTimeoutSeconds: config.authShortAbsoluteTimeoutSeconds,
    })
  })

  it('returns long session policy when rememberMe is true', () => {
    expect(getSessionPolicy(true)).toEqual({
      idleTimeoutSeconds: config.authLongIdleTimeoutSeconds,
      absoluteTimeoutSeconds: config.authLongAbsoluteTimeoutSeconds,
    })
  })
})
