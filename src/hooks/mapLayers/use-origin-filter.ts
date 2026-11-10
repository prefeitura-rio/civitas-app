import { useCallback, useMemo, useState } from 'react'

export interface OriginCount {
  origin: string
  count: number
}

export interface OriginFilter<T> {
  /** Records whose origin is not hidden; the input reference when nothing is hidden. */
  visibleData: T[] | undefined
  /** Counts over the full dataset, largest first, so hidden origins stay listed. */
  originCounts: OriginCount[]
  hiddenOrigins: ReadonlySet<string>
  toggleOrigin: (origin: string) => void
  showAllOrigins: () => void
}

const NO_HIDDEN_ORIGINS: ReadonlySet<string> = new Set()

/**
 * Filters a point layer by origin (company or camera system).
 *
 * @param getOrigin - Must be stable (module-level); it is a memo dependency.
 * @remarks `visibleData` keeps its reference until data or the hidden set changes,
 * so spatial indexes built from it are not rebuilt on hover or selection.
 */
export function useOriginFilter<T>(
  data: T[] | undefined,
  getOrigin: (point: T) => string,
): OriginFilter<T> {
  const [hiddenOrigins, setHiddenOrigins] = useState(NO_HIDDEN_ORIGINS)

  const originCounts = useMemo(() => {
    const counts = new Map<string, number>()
    data?.forEach((point) => {
      const origin = getOrigin(point)
      counts.set(origin, (counts.get(origin) ?? 0) + 1)
    })
    return [...counts]
      .map(([origin, count]) => ({ origin, count }))
      .sort((a, b) => b.count - a.count || a.origin.localeCompare(b.origin))
  }, [data, getOrigin])

  const visibleData = useMemo(
    () =>
      hiddenOrigins.size
        ? data?.filter((point) => !hiddenOrigins.has(getOrigin(point)))
        : data,
    [data, hiddenOrigins, getOrigin],
  )

  const toggleOrigin = useCallback((origin: string) => {
    setHiddenOrigins((current) => {
      const next = new Set(current)
      if (!next.delete(origin)) next.add(origin)
      return next
    })
  }, [])

  const showAllOrigins = useCallback(
    () => setHiddenOrigins(NO_HIDDEN_ORIGINS),
    [],
  )

  return {
    visibleData,
    originCounts,
    hiddenOrigins,
    toggleOrigin,
    showAllOrigins,
  }
}
