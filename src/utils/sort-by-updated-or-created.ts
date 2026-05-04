/** Ordena do mais recente ao mais antigo: usa `updatedAt` se válido, senão `createdAt`. */
export function compareByUpdatedThenCreated<
  T extends { updatedAt?: string | null; createdAt: string },
>(a: T, b: T): number {
  return timestampForSort(b) - timestampForSort(a)
}

function timestampForSort(item: {
  updatedAt?: string | null
  createdAt: string
}): number {
  if (item.updatedAt?.trim()) {
    const u = new Date(item.updatedAt).getTime()
    if (Number.isFinite(u)) return u
  }
  const c = new Date(item.createdAt).getTime()
  return Number.isFinite(c) ? c : 0
}
