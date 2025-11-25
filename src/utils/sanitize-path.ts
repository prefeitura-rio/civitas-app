export const sanitizePath = (raw: string): string => {
  // 1. Remove ".." sequences to prevent directory traversal
  let cleaned = raw.replace(/\.\./g, '')

  // 2. Remove leading slashes and multiple consecutive slashes
  cleaned = cleaned.replace(/^\/+/, '').replace(/\/+/g, '/')

  // 3. Trim whitespace
  return cleaned.trim()
}
