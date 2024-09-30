import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { People } from '@/models/entities'

interface UsePeopleProps {
  cpf: string
}

export function usePeople({ cpf }: UsePeopleProps) {
  return useQuery({
    queryKey: ['people', cpf],
    queryFn: async () => {
      const response = await api.get<People>(`/people/${cpf}`)
      return response.data
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}
