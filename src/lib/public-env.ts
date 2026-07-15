/**
 * Runtime public environment variables.
 *
 * Both local development and production use the same mechanism:
 *
 *   - Server-side: process.env[key]   — Next.js loads .env.local in dev;
 *                                        Infisical injects the vars in production.
 *   - Client-side: window.__ENV__[key] — written by scripts/generate-env-config.js
 *                                        (predev) in dev and by
 *                                        scripts/docker-entrypoint.sh in production.
 *
 * No NEXT_PUBLIC_* vars are needed. All keys are unprefixed (e.g. CIVITAS_API_URL).
 */

export type PublicEnvKey =
  | 'CIVITAS_API_URL'
  | 'MAPBOX_ACCESS_TOKEN'
  | 'ENABLE_CHAMADOS'
  | 'ENABLE_IMPERSONATION'
  | 'APP_URL'

declare global {
  interface Window {
    __ENV__?: Partial<Record<PublicEnvKey, string>>
  }
}

/**
 * Returns a public env var from the correct source for the current context:
 *   - Server: process.env[key]
 *   - Client: window.__ENV__[key]
 */
export function getPublicEnv(key: PublicEnvKey): string | undefined {
  if (typeof window === 'undefined') {
    return process.env[key]
  }
  return window.__ENV__?.[key]
}
