import { config } from '@/config'

export type SessionPolicy = {
  idleTimeoutSeconds: number
  absoluteTimeoutSeconds: number
}

export function getSessionPolicy(rememberMe: boolean): SessionPolicy {
  if (rememberMe) {
    return {
      idleTimeoutSeconds: config.authLongIdleTimeoutSeconds,
      absoluteTimeoutSeconds: config.authLongAbsoluteTimeoutSeconds,
    }
  }

  return {
    idleTimeoutSeconds: config.authShortIdleTimeoutSeconds,
    absoluteTimeoutSeconds: config.authShortAbsoluteTimeoutSeconds,
  }
}
