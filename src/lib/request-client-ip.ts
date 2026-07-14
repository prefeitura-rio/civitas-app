import net from 'net'

const DIRECT_CLIENT_IP_HEADERS = [
  'cf-connecting-ip',
  'true-client-ip',
  'x-client-ip',
]

const FORWARDED_FOR_HEADERS = ['x-original-forwarded-for', 'x-forwarded-for']

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

function getIpsFromList(value: string | null) {
  const ips: string[] = []
  if (!value) return ips

  for (const item of value.split(',')) {
    const ip = normalizeIpCandidate(item)
    if (ip) ips.push(ip)
  }

  return ips
}

function getIpsFromForwardedHeader(value: string | null) {
  const ips: string[] = []
  if (!value) return ips

  for (const forwardedEntry of value.split(',')) {
    const params = forwardedEntry.split(';')

    for (const param of params) {
      const [key, ...rest] = param.split('=')
      if (key.trim().toLowerCase() !== 'for') continue

      const ip = normalizeIpCandidate(rest.join('='))
      if (ip) ips.push(ip)
    }
  }

  return ips
}

function formatForwardedForHeader(ip: string) {
  return ip.includes(':') ? `for="[${ip}]"` : `for=${ip}`
}

export function getClientIpFromHeaders(headers: Headers) {
  for (const header of DIRECT_CLIENT_IP_HEADERS) {
    const ip = normalizeIpCandidate(headers.get(header) ?? '')
    if (ip) return ip
  }

  for (const header of FORWARDED_FOR_HEADERS) {
    const [ip] = getIpsFromList(headers.get(header))
    if (ip) return ip
  }

  const [forwardedIp] = getIpsFromForwardedHeader(headers.get('forwarded'))
  if (forwardedIp) return forwardedIp

  return normalizeIpCandidate(headers.get('x-real-ip') ?? '')
}

function getForwardedForHeader(headers: Headers, clientIp: string | null) {
  for (const header of FORWARDED_FOR_HEADERS) {
    const ips = getIpsFromList(headers.get(header))
    if (ips.length > 0) return ips.join(', ')
  }

  return clientIp
}

export function setForwardedClientIpHeaders(headers: Headers, source: Headers) {
  const clientIp = getClientIpFromHeaders(source)
  if (!clientIp) return

  const forwardedFor = getForwardedForHeader(source, clientIp)
  if (forwardedFor) {
    headers.set('x-forwarded-for', forwardedFor)
  }

  headers.set('x-real-ip', clientIp)
  headers.set('x-client-ip', clientIp)
  headers.set('forwarded', formatForwardedForHeader(clientIp))
}
