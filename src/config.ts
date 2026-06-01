// This function will validate and return the environment variables
const getConfig = () => {
  const isTruthy = (value?: string) => value?.toLowerCase() === 'true'
  const isTestEnv = process.env.NODE_ENV === 'test'
  const isServer = typeof window === 'undefined'

  const apiUrl = process.env.NEXT_PUBLIC_CIVITAS_API_URL
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_CIVITAS_API_URL is not set')
  }
  // Trim any trailing slash from the API URL
  const trimmedApiUrl = apiUrl.replace(/\/+$/, '')

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  if (!mapboxAccessToken) {
    throw new Error('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set')
  }

  const enableChamados = isTruthy(process.env.NEXT_PUBLIC_ENABLE_CHAMADOS)
  const enableImpersonation = isTruthy(
    process.env.NEXT_PUBLIC_ENABLE_IMPERSONATION,
  )
  const enablePrivacyPage = isTruthy(
    process.env.NEXT_PUBLIC_ENABLE_PRIVACY_PAGE,
  )

  const authSessionSecret =
    process.env.AUTH_SESSION_SECRET ??
    (isTestEnv ? 'test-session-secret' : undefined)
  if (isServer && !authSessionSecret) {
    throw new Error('AUTH_SESSION_SECRET is not set')
  }

  const authCookieSecure =
    process.env.AUTH_COOKIE_SECURE === 'true' ||
    process.env.NODE_ENV === 'production'

  const authCookieSameSite = (process.env.AUTH_COOKIE_SAMESITE ?? 'lax') as
    | 'lax'
    | 'strict'
    | 'none'
  if (!['lax', 'strict', 'none'].includes(authCookieSameSite)) {
    throw new Error('AUTH_COOKIE_SAMESITE must be one of: lax, strict, none')
  }

  const authTokenPath = process.env.AUTH_TOKEN_PATH ?? '/auth/token'
  const authAccessTokenRefreshLeewaySeconds = Number(
    process.env.AUTH_ACCESS_TOKEN_REFRESH_LEEWAY_SECONDS ?? 60,
  )
  if (Number.isNaN(authAccessTokenRefreshLeewaySeconds)) {
    throw new Error('AUTH_ACCESS_TOKEN_REFRESH_LEEWAY_SECONDS must be a number')
  }

  const authShortIdleTimeoutSeconds = Number(
    process.env.AUTH_SHORT_IDLE_TIMEOUT_SECONDS,
  )
  if (isServer && Number.isNaN(authShortIdleTimeoutSeconds)) {
    throw new Error('AUTH_SHORT_IDLE_TIMEOUT_SECONDS must be a number')
  }

  const authShortAbsoluteTimeoutSeconds = Number(
    process.env.AUTH_SHORT_ABSOLUTE_TIMEOUT_SECONDS,
  )
  if (isServer && Number.isNaN(authShortAbsoluteTimeoutSeconds)) {
    throw new Error('AUTH_SHORT_ABSOLUTE_TIMEOUT_SECONDS must be a number')
  }

  const authLongIdleTimeoutSeconds = Number(
    process.env.AUTH_LONG_IDLE_TIMEOUT_SECONDS,
  )
  if (isServer && Number.isNaN(authLongIdleTimeoutSeconds)) {
    throw new Error('AUTH_LONG_IDLE_TIMEOUT_SECONDS must be a number')
  }

  const authLongAbsoluteTimeoutSeconds = Number(
    process.env.AUTH_LONG_ABSOLUTE_TIMEOUT_SECONDS,
  )
  if (isServer && Number.isNaN(authLongAbsoluteTimeoutSeconds)) {
    throw new Error('AUTH_LONG_ABSOLUTE_TIMEOUT_SECONDS must be a number')
  }

  return {
    apiUrl: trimmedApiUrl,
    mapboxAccessToken,
    enableChamados,
    enableImpersonation,
    enablePrivacyPage,
    authSessionSecret: authSessionSecret ?? '',
    authCookieSecure,
    authCookieSameSite,
    authTokenPath,
    authAccessTokenRefreshLeewaySeconds,
    authShortIdleTimeoutSeconds: Number.isNaN(authShortIdleTimeoutSeconds)
      ? 0
      : authShortIdleTimeoutSeconds,
    authShortAbsoluteTimeoutSeconds: Number.isNaN(
      authShortAbsoluteTimeoutSeconds,
    )
      ? 0
      : authShortAbsoluteTimeoutSeconds,
    authLongIdleTimeoutSeconds: Number.isNaN(authLongIdleTimeoutSeconds)
      ? 0
      : authLongIdleTimeoutSeconds,
    authLongAbsoluteTimeoutSeconds: Number.isNaN(authLongAbsoluteTimeoutSeconds)
      ? 0
      : authLongAbsoluteTimeoutSeconds,
  }
}

export const config = getConfig()
