function getTrustedHosts(request: Request) {
  const trustedHosts = new Set<string>()

  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (host) {
    trustedHosts.add(host)
  }

  // APP_URL is a server-side env var (no NEXT_PUBLIC_ prefix) — injected by
  // Infisical in production and defined in .env.local for local development.
  const appUrl = process.env.APP_URL
  if (appUrl) {
    try {
      trustedHosts.add(new URL(appUrl).host)
    } catch {
      // ignore malformed APP_URL
    }
  }

  return trustedHosts
}

export function isTrustedOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) {
    return false
  }

  try {
    const originHost = new URL(origin).host
    const trustedHosts = getTrustedHosts(request)

    return trustedHosts.has(originHost)
  } catch {
    return false
  }
}
