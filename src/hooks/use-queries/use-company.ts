import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { Company } from '@/models/entities'

interface UseCompanyProps {
  cnpj: string
}

export function useCompany({ cnpj }: UseCompanyProps) {
  return useQuery({
    queryKey: ['companies', cnpj],
    queryFn: async () => {
      const response = await api.get<Company>(`/companies/${cnpj}`)
      return response.data
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}
