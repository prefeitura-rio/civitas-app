import type { FieldErrors } from 'react-hook-form'

export function getFirstFormError(
  errors: FieldErrors,
  path: string[] = [],
): { path: string[]; message: string } | undefined {
  for (const [key, value] of Object.entries(errors)) {
    if (!value || typeof value !== 'object') continue
    const currentPath = [...path, key]
    if ('message' in value && typeof value.message === 'string') {
      const message = value.message.trim()
      if (message) return { path: currentPath, message }
    }
    const nested = getFirstFormError(value as FieldErrors, currentPath)
    if (nested) return nested
  }
  return undefined
}
