import net from 'net'

const DIRECT_CLIENT_IP_HEADERS = [
  'cf-connecting-ip',
  'true-client-ip',
  'x-client-ip',
]

function normalizeIpCandidate(value: string) {
  let candidate = value.trim().replace(/^"|"$/g, '')

  if (!candidate || candidate.toLowerCase() === 'unknown') {
    return null
  }

  if (candidate.startsWith('[')) {
    const closingBracketIndex = candidate.indexOf(']')
    if (closingBracketIndex > 0) {
      candidate = candidate.slice(1, closingBracketIndex)
    }
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(candidate)) {
    candidate = candidate.slice(0, candidate.lastIndexOf(':'))
  }

  return net.isIP(candidate) ? candidate : null
}

function getFirstIpFromList(value: string | null) {
  if (!value) return null

  for (const item of value.split(',')) {
    const ip = normalizeIpCandidate(item)
    if (ip) return ip
  }

  return null
}

function getFirstIpFromForwardedHeader(value: string | null) {
  if (!value) return null

  for (const forwardedEntry of value.split(',')) {
    const params = forwardedEntry.split(';')

    for (const param of params) {
      const [key, ...rest] = param.split('=')
      if (key.trim().toLowerCase() !== 'for') continue

      const ip = normalizeIpCandidate(rest.join('='))
      if (ip) return ip
    }
  }

  return null
}

function formatForwardedForHeader(ip: string) {
  return ip.includes(':') ? `for="[${ip}]"` : `for=${ip}`
}

export function getClientIpFromHeaders(headers: Headers) {
  for (const header of DIRECT_CLIENT_IP_HEADERS) {
    const ip = normalizeIpCandidate(headers.get(header) ?? '')
    if (ip) return ip
  }

  return (
    getFirstIpFromList(headers.get('x-forwarded-for')) ??
    getFirstIpFromForwardedHeader(headers.get('forwarded')) ??
    normalizeIpCandidate(headers.get('x-real-ip') ?? '')
  )
}

export function setForwardedClientIpHeaders(
  headers: Headers,
  clientIp: string | null,
) {
  if (!clientIp) return

  headers.set('x-forwarded-for', clientIp)
  headers.set('x-real-ip', clientIp)
  headers.set('x-client-ip', clientIp)
  headers.set('forwarded', formatForwardedForHeader(clientIp))
}
