import { useQuery } from '@tanstack/react-query'

import { getCameraCOR } from '@/http/cameras-cor/get-cameras-cor'

export function useCameras() {
  return useQuery({
    queryKey: ['cameras'],
    queryFn: () => getCameraCOR(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
}
