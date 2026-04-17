'use client'
import { useQuery } from '@tanstack/react-query'

import { getCollectionPoints } from '@/http/collection-points/get-collection-points'

export function useCollectionPoints() {
  return useQuery({
    queryKey: ['collection-points'],
    queryFn: () => getCollectionPoints(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
}
