/// <reference types="jest" />

import { getSessionPolicy } from '@/auth/session-config'
import { getServerConfig } from '@/config'

describe('session-config', () => {
  it('returns short session policy when rememberMe is false', () => {
    const config = getServerConfig()

    expect(getSessionPolicy(false)).toEqual({
      idleTimeoutSeconds: config.authShortIdleTimeoutSeconds,
      absoluteTimeoutSeconds: config.authShortAbsoluteTimeoutSeconds,
    })
  })

  it('returns long session policy when rememberMe is true', () => {
    const config = getServerConfig()

    expect(getSessionPolicy(true)).toEqual({
      idleTimeoutSeconds: config.authLongIdleTimeoutSeconds,
      absoluteTimeoutSeconds: config.authLongAbsoluteTimeoutSeconds,
    })
  })
})
