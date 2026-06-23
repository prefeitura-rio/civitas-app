import { api } from '@/lib/api'

export type GetTicketsParams = {
  search: string
}

export type GetTicketsResponse = Array<{
  id: string
  created_at: string
  title: string
  ticket_type_name: string
}>

export async function getTicketsSelect({ search }: GetTicketsParams) {
  const response = await api.get<GetTicketsResponse>('/tickets/search', {
    params: {
      search,
    },
  })

  return response
}
