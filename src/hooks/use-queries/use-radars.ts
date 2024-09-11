import { useQuery } from '@tanstack/react-query'

import { getRadars } from '@/http/radars/get-radars'

export function useRadars() {
  return useQuery({
    queryKey: ['radars'],
    queryFn: () => getRadars(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
}
