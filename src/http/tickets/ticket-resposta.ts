import { api } from '@/lib/api'

export type TicketRespostaAttachmentPlaybackOut = {
  signed_url?: string | null

  expires_at?: string | null
}

export type TicketAttachmentWithPlaybackOut = {
  id: string

  filename: string

  content_type?: string | null

  size_bytes: number

  created_at: string

  service_type?: string | null

  service_id?: string | null

  playback?: TicketRespostaAttachmentPlaybackOut | null
}

export type TicketResponseReportOut = {
  id: string | null

  ticket_id: string

  html_content: string

  created_at: string | null

  updated_at: string | null

  updated_by_id: string | null

  updated_by_name: string | null

  service_attachments: TicketAttachmentWithPlaybackOut[]
}

/** @deprecated Use TicketResponseReportOut */

export type TicketRespostaOut = TicketResponseReportOut

function normalizeTicketResponseReportOut(
  data: TicketResponseReportOut,
): TicketResponseReportOut {
  return {
    ...data,

    service_attachments: data.service_attachments ?? [],
  }
}

export async function getTicketResposta(ticketId: string) {
  const { data } = await api.get<TicketResponseReportOut>(
    `/tickets/${encodeURIComponent(ticketId)}/response-report`,
  )

  return normalizeTicketResponseReportOut(data)
}

export type TicketResponseReportUpdateIn = {
  html_content: string

  service_attachment_ids?: string[]
}

export type PutTicketRespostaPayload = TicketResponseReportUpdateIn

export async function putTicketResposta(
  ticketId: string,

  payload: TicketResponseReportUpdateIn,
  files: File[] = [],
) {
  const form = new FormData()
  form.append('payload', JSON.stringify(payload))
  for (const file of files) {
    form.append('files', file)
  }

  const { data } = await api.put<TicketResponseReportOut>(
    `/tickets/${encodeURIComponent(ticketId)}/response-report`,

    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )

  return normalizeTicketResponseReportOut(data)
}
