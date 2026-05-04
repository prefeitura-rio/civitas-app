import { api, isApiError } from '@/lib/api'

export type TicketRespostaOut = {
  id: string | null
  chamado_id: string
  conteudo_html: string
  criado_em: string | null
  atualizado_em: string | null
  atualizado_por_id: string | null
  atualizado_por_nome: string | null
}

export async function getTicketResposta(ticketId: string) {
  try {
    const { data } = await api.get<TicketRespostaOut>(
      `/tickets/${encodeURIComponent(ticketId)}/relatorio-resposta`,
    )
    return data
  } catch (err: unknown) {
    if (isApiError(err) && err.response?.status === 404) {
      return null
    }
    throw err
  }
}

export type PutTicketRespostaPayload = {
  conteudo_html: string
}

export async function putTicketResposta(
  ticketId: string,
  payload: PutTicketRespostaPayload,
) {
  const { data } = await api.put<TicketRespostaOut>(
    `/tickets/${encodeURIComponent(ticketId)}/relatorio-resposta`,
    payload,
  )
  return data
}
