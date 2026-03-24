import { api } from '@/lib/api'

export type SearchOption = {
  label: string
  value: string
}

type OperationSearchResponse = {
  id: string
  title: string
}

type RequesterSearchResponse = {
  requisitante: string
}

export async function searchOperations(
  search: string,
): Promise<SearchOption[]> {
  const response = await api.get<OperationSearchResponse[]>(
    '/operations/search',
    {
      params: { search },
    },
  )

  return response.data.map((item) => ({
    label: item.title,
    value: item.id,
  }))
}

export async function searchRequesters(
  search: string,
): Promise<SearchOption[]> {
  const response = await api.get<RequesterSearchResponse[]>(
    '/tickets/requesters/search',
    {
      params: { search },
    },
  )

  return response.data.map((item) => ({
    label: item.requisitante,
    value: item.requisitante,
  }))
}
