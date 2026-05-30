import { api, isApiError } from '@/lib/api'

/** Resposta GET/PUT `/tickets/{id}/demand-report`. */
export type TicketDemandReportOut = {
  id: string | null
  ticket_id: string
  html_content: string
  created_at: string | null
  updated_at: string | null
  updated_by_id: string | null
  updated_by_name: string | null
}

export async function getTicketRelatorioDemanda(ticketId: string) {
  try {
    const { data } = await api.get<TicketDemandReportOut>(
      `/tickets/${encodeURIComponent(ticketId)}/demand-report`,
    )
    return data
  } catch (err: unknown) {
    if (isApiError(err) && err.response?.status === 404) {
      return null
    }
    throw err
  }
}

export type PutTicketRelatorioDemandaPayload = {
  html_content: string
}

/** PUT multipart: `payload` (JSON) + `files` (imagens novas), como em POST `/tickets`. */
export async function putTicketRelatorioDemanda(
  ticketId: string,
  body: PutTicketRelatorioDemandaPayload,
  files: File[] = [],
) {
  const form = new FormData()
  form.append('payload', JSON.stringify(body))
  for (const f of files) {
    form.append('files', f)
  }

  const { data } = await api.put<TicketDemandReportOut>(
    `/tickets/${encodeURIComponent(ticketId)}/demand-report`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}
