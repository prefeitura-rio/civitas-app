import { api, isApiError } from '@/lib/api'

/** Resposta GET/PUT `/tickets/{id}/relatorio-demanda`. */
export type TicketDemandReportOut = {
  id: string | null
  chamado_id: string
  conteudo_html: string
  criado_em: string | null
  atualizado_em: string | null
  atualizado_por_id: string | null
  atualizado_por_nome: string | null
}

export async function getTicketRelatorioDemanda(ticketId: string) {
  try {
    const { data } = await api.get<TicketDemandReportOut>(
      `/tickets/${encodeURIComponent(ticketId)}/relatorio-demanda`,
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
  conteudo_html: string
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
    `/tickets/${encodeURIComponent(ticketId)}/relatorio-demanda`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}
