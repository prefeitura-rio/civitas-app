export function setForwardedClientIpHeaders(headers: Headers, source: Headers) {
  const forwardedFor = source.get('x-forwarded-for')

  if (forwardedFor) {
    headers.set('x-forwarded-for', forwardedFor)
  }
}
