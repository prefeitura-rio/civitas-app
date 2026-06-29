import { api } from '@/lib/api'

interface CreateTicketNatureRequest {
  name: string
  is_active?: boolean
}

export function createTicketNature(data: CreateTicketNatureRequest) {
  return api.post<boolean>('/ticket-natures', data)
}
