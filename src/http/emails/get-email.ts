import { api } from '@/lib/api'

export interface AttachmentOut {
  id: number
  filename: string
  mime_type: string
  size: number
  file_path: string
}

export interface EmailOut {
  id: string
  thread_id?: string | null
  from_address?: string | null
  from_name?: string | null
  to_address?: string | null
  subject?: string | null
  snippet?: string | null
  body_preview?: string | null
  date?: string | null
  internal_date?: number | null
  has_attachments: boolean
  is_read: boolean
  label_ids?: string | null
  created_at: string
  updated_at: string
  attachments: AttachmentOut[]
}

export function getEmailById(id: string) {
  return api.get<EmailOut>(`/emails/${encodeURIComponent(id)}`)
}
