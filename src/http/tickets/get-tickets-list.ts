import { api } from '@/lib/api'

export type GetTicketsParams = {
  search: string
}

export type GetTicketsResponse = Array<{
  id: string
  criado_em: string
  titulo: string
}>

export async function getTicketsSelect({ search }: GetTicketsParams) {
  const response = await api.get<GetTicketsResponse>('/tickets/search', {
    params: {
      search,
    },
  })

  return response
}
