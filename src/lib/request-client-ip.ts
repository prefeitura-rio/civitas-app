import { isIP } from 'node:net'

const CLIENT_IP_HEADERS = [
  'cf-connecting-ip',
  'true-client-ip',
  'x-real-ip',
  'x-client-ip',
  'x-forwarded-for',
  'x-original-forwarded-for',
  'forwarded',
]

function stripIpPort(value: string) {
  const trimmed = value.trim().replace(/^"|"$/g, '')

  if (trimmed.startsWith('[')) {
    return trimmed.slice(1).split(']', 1)[0]
  }

  if (trimmed.includes('.') && trimmed.split(':').length === 2) {
    return trimmed.split(':')[0]
  }

  return trimmed
}

function parseForwardedHeader(value: string) {
  const ips: string[] = []

  for (const item of value.split(',')) {
    for (const part of item.split(';')) {
      const [key, rawValue] = part.split('=')
      if (key?.trim().toLowerCase() !== 'for' || !rawValue) {
        continue
      }

      const ip = normalizeIp(rawValue)
      if (ip) {
        ips.push(ip)
      }
    }
  }

  return ips
}

function normalizeIp(value: string) {
  const ip = stripIpPort(value)

  return isIP(ip) ? ip : null
}

function isPrivateOrLocalIpv4(ip: string) {
  const octets = ip.split('.').map(Number)
  const [first, second] = octets

  return (
    first === 10 ||
    first === 127 ||
    first === 0 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  )
}

function isPrivateOrLocalIpv6(ip: string) {
  const lowerIp = ip.toLowerCase()

  return (
    lowerIp === '::1' ||
    lowerIp.startsWith('fc') ||
    lowerIp.startsWith('fd') ||
    lowerIp.startsWith('fe80:')
  )
}

function isPrivateOrLocalIp(ip: string) {
  const ipVersion = isIP(ip)

  if (ipVersion === 4) {
    return isPrivateOrLocalIpv4(ip)
  }

  if (ipVersion === 6) {
    return isPrivateOrLocalIpv6(ip)
  }

  return true
}

function getClientIpCandidates(source: Headers) {
  const candidates: string[] = []

  for (const header of CLIENT_IP_HEADERS) {
    const value = source.get(header)
    if (!value) {
      continue
    }

    if (header === 'forwarded') {
      candidates.push(...parseForwardedHeader(value))
      continue
    }

    for (const item of value.split(',')) {
      const ip = normalizeIp(item)
      if (ip) {
        candidates.push(ip)
      }
    }
  }

  return candidates
}

export function getForwardedClientIp(source: Headers) {
  const candidates = getClientIpCandidates(source)

  return candidates.find((ip) => !isPrivateOrLocalIp(ip)) ?? candidates[0]
}

export function setForwardedClientIpHeaders(headers: Headers, source: Headers) {
  const clientIp = getForwardedClientIp(source)

  if (!clientIp) {
    return
  }

  headers.set('x-forwarded-for', clientIp)
  headers.set('x-real-ip', clientIp)
}
