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
  chamado_id: string
  conteudo_html: string
  criado_em: string | null
  atualizado_em: string | null
  atualizado_por_id: string | null
  atualizado_por_nome: string | null
  anexos_servico: TicketAttachmentWithPlaybackOut[]
}

/** @deprecated Use TicketResponseReportOut */
export type TicketRespostaOut = TicketResponseReportOut

function normalizeTicketResponseReportOut(
  data: TicketResponseReportOut,
): TicketResponseReportOut {
  return {
    ...data,
    anexos_servico: data.anexos_servico ?? [],
  }
}

export async function getTicketResposta(ticketId: string) {
  const { data } = await api.get<TicketResponseReportOut>(
    `/tickets/${encodeURIComponent(ticketId)}/relatorio-resposta`,
  )
  return normalizeTicketResponseReportOut(data)
}

export type TicketResponseReportUpdateIn = {
  conteudo_html: string
  anexos_servico_ids?: string[]
}

export type PutTicketRespostaPayload = TicketResponseReportUpdateIn

export async function putTicketResposta(
  ticketId: string,
  payload: TicketResponseReportUpdateIn,
) {
  const { data } = await api.put<TicketResponseReportOut>(
    `/tickets/${encodeURIComponent(ticketId)}/relatorio-resposta`,
    payload,
  )
  return normalizeTicketResponseReportOut(data)
}
