function getTrustedHosts(request: Request) {
  const trustedHosts = new Set<string>()

  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (host) {
    trustedHosts.add(host)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl) {
    try {
      trustedHosts.add(new URL(appUrl).host)
    } catch {
      // ignore malformed NEXT_PUBLIC_APP_URL
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
