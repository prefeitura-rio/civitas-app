import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { FeatureCollection, Geometry } from 'geojson'
import { useEffect } from 'react'

const REFERENCE_GEOJSON_QUERY_KEY = 'reference-geojson'

/**
 * Loads a reference layer only while enabled. Successful results stay fresh
 * while retained by React Query's cache; after cache eviction they load again.
 * In-flight requests are cancelled when hidden or unmounted. Failures remain
 * available to callers and can be retried by toggling the layer off and on.
 */
export function useReferenceGeoJson<G extends Geometry, P>(
  url: string,
  enabled: boolean,
) {
  const client = useQueryClient()
  const queryKey = [REFERENCE_GEOJSON_QUERY_KEY, url] as const
  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }): Promise<FeatureCollection<G, P>> => {
      const response = await fetch(url, { signal })
      if (!response.ok)
        throw new Error(`Reference layer request failed (${response.status})`)
      return response.json()
    },
    enabled,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!enabled) return
    return () => {
      client.cancelQueries({
        queryKey: [REFERENCE_GEOJSON_QUERY_KEY, url],
        exact: true,
      })
    }
  }, [client, enabled, url])

  return query
}
