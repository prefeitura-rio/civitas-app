import { getPublicEnv } from '@/lib/public-env'

type AuthCookieSameSite = 'lax' | 'strict' | 'none'

// During `next build`, Next.js loads route handlers to collect page metadata,
// which triggers module-level code like `export const config = getConfig()`.
// At that point no runtime env vars exist yet (Infisical injects them at
// container startup, not at image build time). We detect the build phase and
// return safe empty defaults so the build succeeds; the real values are
// validated on the first actual request at runtime.
const isBuildPhase =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NEXT_PHASE === 'phase-export' ||
  process.env.NODE_ENV === 'test'

function getServerNumberEnv(name: string) {
  const value = Number(process.env[name])
  if (Number.isNaN(value)) {
    throw new Error(`${name} must be a number`)
  }
  return value
}

const getConfig = () => {
  const isTruthy = (value?: string) => value?.toLowerCase() === 'true'

  const apiUrl = getPublicEnv('CIVITAS_API_URL')
  if (!apiUrl && !isBuildPhase) {
    throw new Error('CIVITAS_API_URL is not set')
  }

  const mapboxAccessToken = getPublicEnv('MAPBOX_ACCESS_TOKEN')
  if (!mapboxAccessToken && !isBuildPhase) {
    throw new Error('MAPBOX_ACCESS_TOKEN is not set')
  }

  return {
    apiUrl: (apiUrl ?? '').replace(/\/+$/, ''),
    mapboxAccessToken: mapboxAccessToken ?? '',
    enableChamados: isTruthy(getPublicEnv('ENABLE_CHAMADOS')),
    enableImpersonation: isTruthy(getPublicEnv('ENABLE_IMPERSONATION')),
  }
}

export const config = getConfig()

export function getServerConfig() {
  const isTestEnv = process.env.NODE_ENV === 'test'
  const authSessionSecret =
    process.env.AUTH_SESSION_SECRET ??
    (isTestEnv ? 'test-session-secret' : undefined)
  if (!authSessionSecret) {
    throw new Error('AUTH_SESSION_SECRET is not set')
  }

  const authCookieSameSite = (process.env.AUTH_COOKIE_SAMESITE ??
    'lax') as AuthCookieSameSite
  if (!['lax', 'strict', 'none'].includes(authCookieSameSite)) {
    throw new Error('AUTH_COOKIE_SAMESITE must be one of: lax, strict, none')
  }

  const authAccessTokenRefreshLeewaySeconds = Number(
    process.env.AUTH_ACCESS_TOKEN_REFRESH_LEEWAY_SECONDS ?? 60,
  )
  if (Number.isNaN(authAccessTokenRefreshLeewaySeconds)) {
    throw new Error('AUTH_ACCESS_TOKEN_REFRESH_LEEWAY_SECONDS must be a number')
  }

  return {
    ...config,
    authSessionSecret,
    authCookieSecure:
      process.env.AUTH_COOKIE_SECURE === 'true' ||
      process.env.NODE_ENV === 'production',
    authCookieSameSite,
    authTokenPath: process.env.AUTH_TOKEN_PATH ?? '/auth/token',
    authAccessTokenRefreshLeewaySeconds,
    authShortIdleTimeoutSeconds: getServerNumberEnv(
      'AUTH_SHORT_IDLE_TIMEOUT_SECONDS',
    ),
    authShortAbsoluteTimeoutSeconds: getServerNumberEnv(
      'AUTH_SHORT_ABSOLUTE_TIMEOUT_SECONDS',
    ),
    authLongIdleTimeoutSeconds: getServerNumberEnv(
      'AUTH_LONG_IDLE_TIMEOUT_SECONDS',
    ),
    authLongAbsoluteTimeoutSeconds: getServerNumberEnv(
      'AUTH_LONG_ABSOLUTE_TIMEOUT_SECONDS',
    ),
  }
}
