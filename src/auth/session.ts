import crypto from 'crypto'

import { config, getServerConfig } from '@/config'

import { getSessionPolicy } from './session-config'

const SESSION_COOKIE_NAME = 'session'
const ACCESS_TOKEN_COOKIE_NAME = 'token'

type OAuthTokenResponse = {
  access_token: string
  expires_in: number
  token_type?: string
}

type SessionPayload = {
  accessToken: string
  username: string
  password: string
  accessTokenExpiresAt: number
  createdAt: number
  lastActivityAt: number
  rememberMe: boolean
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME
}

export function getAccessTokenCookieName() {
  return ACCESS_TOKEN_COOKIE_NAME
}

function toBase64Url(input: Buffer | string) {
  const value = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return value.toString('base64url')
}

function fromBase64Url(input: string) {
  return Buffer.from(input, 'base64url')
}

function getDerivedKeys() {
  const secret = getServerConfig().authSessionSecret

  const signingKey = crypto
    .createHmac('sha256', secret)
    .update('signing-key')
    .digest()

  const encryptionKey = crypto
    .createHash('sha256')
    .update(`${secret}:encryption-key`)
    .digest()

  return { signingKey, encryptionKey }
}

function sealSession(payload: SessionPayload) {
  const { signingKey, encryptionKey } = getDerivedKeys()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv)

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()
  const body = [
    toBase64Url(iv),
    toBase64Url(encrypted),
    toBase64Url(authTag),
  ].join('.')
  const signature = toBase64Url(
    crypto.createHmac('sha256', signingKey).update(body).digest(),
  )

  return `${body}.${signature}`
}

function unsealSession(value: string): SessionPayload | null {
  const parts = value.split('.')
  if (parts.length !== 4) return null

  const [ivPart, encryptedPart, authTagPart, signaturePart] = parts
  const { signingKey, encryptionKey } = getDerivedKeys()

  const body = [ivPart, encryptedPart, authTagPart].join('.')
  const expectedSignature = toBase64Url(
    crypto.createHmac('sha256', signingKey).update(body).digest(),
  )

  const signatureBuf = Buffer.from(signaturePart)
  const expectedBuf = Buffer.from(expectedSignature)

  if (
    signatureBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(signatureBuf, expectedBuf)
  ) {
    return null
  }

  try {
    const iv = fromBase64Url(ivPart)
    const encrypted = fromBase64Url(encryptedPart)
    const authTag = fromBase64Url(authTagPart)

    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8')

    const parsed = JSON.parse(decrypted) as SessionPayload

    if (
      !parsed.accessToken ||
      !parsed.username ||
      !parsed.password ||
      !parsed.createdAt ||
      !parsed.lastActivityAt ||
      !parsed.accessTokenExpiresAt
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function getCookieOptions(maxAgeSeconds: number) {
  const serverConfig = getServerConfig()

  return {
    httpOnly: true,
    secure: serverConfig.authCookieSecure,
    sameSite: serverConfig.authCookieSameSite,
    path: '/',
    maxAge: maxAgeSeconds,
  } as const
}

function getAccessTokenCookieOptions(maxAgeSeconds: number) {
  const serverConfig = getServerConfig()

  return {
    httpOnly: true,
    secure: serverConfig.authCookieSecure,
    sameSite: serverConfig.authCookieSameSite,
    path: '/',
    maxAge: maxAgeSeconds,
  } as const
}

export function isSessionExpired(session: SessionPayload, nowMs = Date.now()) {
  const policy = getSessionPolicy(session.rememberMe)
  const idleMs = policy.idleTimeoutSeconds * 1000
  const absoluteMs = policy.absoluteTimeoutSeconds * 1000

  return (
    nowMs - session.lastActivityAt > idleMs ||
    nowMs - session.createdAt > absoluteMs
  )
}

function isAccessTokenExpiringSoon(
  session: SessionPayload,
  nowMs = Date.now(),
) {
  const leewayMs = getServerConfig().authAccessTokenRefreshLeewaySeconds * 1000
  return nowMs + leewayMs >= session.accessTokenExpiresAt
}

export function buildSessionFromTokenResponse(
  tokenResponse: OAuthTokenResponse,
  credentials: { username: string; password: string },
  rememberMe: boolean,
): SessionPayload {
  const nowMs = Date.now()

  return {
    accessToken: tokenResponse.access_token,
    username: credentials.username,
    password: credentials.password,
    accessTokenExpiresAt: nowMs + tokenResponse.expires_in * 1000,
    createdAt: nowMs,
    lastActivityAt: nowMs,
    rememberMe,
  }
}

export async function refreshAccessToken(session: SessionPayload) {
  const serverConfig = getServerConfig()
  const response = await fetch(
    `${config.apiUrl}${serverConfig.authTokenPath}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: session.username,
        password: session.password,
      }),
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as OAuthTokenResponse

  if (!data.access_token || !data.expires_in) {
    return null
  }

  return {
    ...session,
    accessToken: data.access_token,
    accessTokenExpiresAt: Date.now() + data.expires_in * 1000,
  }
}

export function isValidSession(sessionValue: string | undefined) {
  if (!sessionValue) {
    return false
  }

  const session = unsealSession(sessionValue)
  if (!session) {
    return false
  }

  return !isSessionExpired(session)
}

export async function validateAndRefreshSession(
  sessionValue: string | undefined,
  touchActivity: boolean,
  refreshIfNeeded = true,
) {
  if (!sessionValue) {
    return { session: null, shouldClear: true, refreshed: false }
  }

  const session = unsealSession(sessionValue)
  if (!session) {
    return { session: null, shouldClear: true, refreshed: false }
  }

  const nowMs = Date.now()

  if (isSessionExpired(session, nowMs)) {
    return { session: null, shouldClear: true, refreshed: false }
  }

  let updatedSession = session
  let refreshed = false

  if (refreshIfNeeded && isAccessTokenExpiringSoon(session, nowMs)) {
    const refreshedSession = await refreshAccessToken(session)
    if (!refreshedSession) {
      return { session: null, shouldClear: true, refreshed: false }
    }

    updatedSession = refreshedSession
    refreshed = true
  }

  if (touchActivity) {
    updatedSession = {
      ...updatedSession,
      lastActivityAt: nowMs,
    }
  }

  return { session: updatedSession, shouldClear: false, refreshed }
}

export function serializeSession(session: SessionPayload) {
  const policy = getSessionPolicy(session.rememberMe)
  return {
    name: SESSION_COOKIE_NAME,
    value: sealSession(session),
    options: getCookieOptions(policy.absoluteTimeoutSeconds),
  }
}

export function serializeAccessToken(session: SessionPayload) {
  const tokenMaxAgeSeconds = Math.max(
    1,
    Math.floor((session.accessTokenExpiresAt - Date.now()) / 1000),
  )

  return {
    name: ACCESS_TOKEN_COOKIE_NAME,
    value: session.accessToken,
    options: getAccessTokenCookieOptions(tokenMaxAgeSeconds),
  }
}

export function clearSessionCookies() {
  const serverConfig = getServerConfig()

  return [
    {
      name: SESSION_COOKIE_NAME,
      value: '',
      options: {
        httpOnly: true,
        secure: serverConfig.authCookieSecure,
        sameSite: serverConfig.authCookieSameSite,
        path: '/',
        maxAge: 0,
      } as const,
    },
    {
      name: ACCESS_TOKEN_COOKIE_NAME,
      value: '',
      options: {
        httpOnly: true,
        secure: serverConfig.authCookieSecure,
        sameSite: serverConfig.authCookieSameSite,
        path: '/',
        maxAge: 0,
      } as const,
    },
  ]
}
