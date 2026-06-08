/** Normaliza respostas `{ items: T[] }` ou `T[]` do dashboard tático. */
export function unwrapDashboardItems<T>(
  value: T[] | { items?: T[] | null } | null | undefined,
): T[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'object' && 'items' in value) {
    const items = (value as { items?: T[] | null }).items
    return Array.isArray(items) ? items : []
  }
  return []
}
