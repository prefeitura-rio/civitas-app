import { useQuery } from '@tanstack/react-query'

import { getCamera } from '@/http/cameras-cor/get-cameras-cor'

export function useCameras() {
  return useQuery({
    queryKey: ['cameras'],
    queryFn: () => getCamera(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
}
