import type { FieldErrors } from 'react-hook-form'

export function getFirstFormErrorMessage(
  errors: FieldErrors,
): string | undefined {
  for (const v of Object.values(errors)) {
    if (!v) continue
    if (typeof v === 'object' && v !== null) {
      if (
        'message' in v &&
        typeof (v as { message?: unknown }).message === 'string'
      ) {
        const msg = (v as { message: string }).message.trim()
        if (msg) return msg
      }
      const nested = getFirstFormErrorMessage(v as FieldErrors)
      if (nested) return nested
    }
  }
  return undefined
}
