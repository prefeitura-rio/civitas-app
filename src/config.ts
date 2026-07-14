import { getPublicEnv } from '@/lib/public-env'

type AuthCookieSameSite = 'lax' | 'strict' | 'none'

function getServerNumberEnv(name: string) {
  const value = Number(process.env[name])
  if (Number.isNaN(value)) {
    throw new Error(`${name} must be a number`)
  }
  return value
}

// This function will validate and return build-safe public environment variables.
//
// Public vars are sourced at runtime from window.__ENV__ (client-side, production)
// or process.env (server-side and local dev). See src/lib/public-env.ts for details.
const getConfig = () => {
  const isTruthy = (value?: string) => value?.toLowerCase() === 'true'

  // The second argument (process.env.NEXT_PUBLIC_*) is statically replaced by Next.js
  // at build time: it becomes the real value in dev builds and undefined in production.
  const apiUrl = getPublicEnv(
    'CIVITAS_API_URL',
    process.env.NEXT_PUBLIC_CIVITAS_API_URL,
  )
  if (!apiUrl) {
    throw new Error('CIVITAS_API_URL is not set')
  }
  // Trim any trailing slash from the API URL
  const trimmedApiUrl = apiUrl.replace(/\/+$/, '')

  const mapboxAccessToken = getPublicEnv(
    'MAPBOX_ACCESS_TOKEN',
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  )
  if (!mapboxAccessToken) {
    throw new Error('MAPBOX_ACCESS_TOKEN is not set')
  }

  const enableChamados = isTruthy(
    getPublicEnv('ENABLE_CHAMADOS', process.env.NEXT_PUBLIC_ENABLE_CHAMADOS),
  )
  const enableImpersonation = isTruthy(
    getPublicEnv(
      'ENABLE_IMPERSONATION',
      process.env.NEXT_PUBLIC_ENABLE_IMPERSONATION,
    ),
  )

  return {
    apiUrl: trimmedApiUrl,
    mapboxAccessToken,
    enableChamados,
    enableImpersonation,
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
