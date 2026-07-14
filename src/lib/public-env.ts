/**
 * Runtime public environment variables.
 *
 * In production (container), these come from window.__ENV__, which is generated
 * at container startup by scripts/docker-entrypoint.sh using values injected
 * by Infisical into the pod's process environment.
 *
 * In local development, window.__ENV__ is empty (the placeholder public/env-config.js
 * defines an empty object), so the getter falls back to Next.js's static
 * NEXT_PUBLIC_* replacements, which are read from .env.local at dev-server startup.
 *
 * On the server side (API routes, server components, middleware), values are read
 * directly from process.env using the unprefixed key (e.g. CIVITAS_API_URL),
 * which Infisical injects in production and .env.local provides in development.
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
 * Returns a public env var, reading from the correct source depending on context:
 *
 * - Server-side:  process.env[key]            (Infisical in prod, .env.local in dev)
 * - Client-side:  window.__ENV__[key]          (container entrypoint in prod)
 *                 || nextPublicFallback        (static NEXT_PUBLIC_ replacement in dev)
 *
 * @param key               Unprefixed key, e.g. 'CIVITAS_API_URL'
 * @param nextPublicFallback Pass `process.env.NEXT_PUBLIC_*` here. Next.js replaces
 *                           this at build time: it becomes the real value in dev builds
 *                           and `undefined` in production builds (no build-arg needed).
 */
export function getPublicEnv(
  key: PublicEnvKey,
  nextPublicFallback: string | undefined,
): string | undefined {
  if (typeof window === 'undefined') {
    // Server-side: read from process environment (Infisical / .env.local)
    return process.env[key]
  }

  // Client-side: production uses window.__ENV__, dev falls back to NEXT_PUBLIC_*
  const runtimeValue = window.__ENV__?.[key]
  if (runtimeValue) return runtimeValue

  return nextPublicFallback
}
