import { api } from '@/lib/api'

export interface EmailBase {
  id: string
  thread_id?: string | null
  from_address?: string | null
  from_name?: string | null
  to_address?: string | null
  subject?: string | null
  snippet?: string | null
  date?: string | null
  internal_date?: number | null
  has_attachments: boolean
  is_read: boolean
}

export interface EmailPageOut {
  items: EmailBase[]
  total: number
}

export function getEmails({
  page,
  pageSize,
}: {
  page: number
  pageSize: number
}) {
  return api.get<EmailPageOut>('/emails', {
    params: { page, pageSize },
  })
}
