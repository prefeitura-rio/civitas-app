import { api } from '@/lib/api'

import type { TicketOut } from './get-ticket-by-id'
import type { TicketAttachmentOut } from './ticket-attachments'
import type { TicketServicosReplaceIn } from './ticket-servicos-types'

/** Mesmo formato dos campos de serviços em TicketOut + anexos sem serviço (GET `/servicos` enriquecido). */
export type TicketServicosOut = Pick<
  TicketOut,
  | 'busca_por_placa'
  | 'busca_por_radar'
  | 'cerco_eletronico'
  | 'busca_por_imagem'
  | 'placas_correlatas'
  | 'placas_conjuntas'
  | 'reserva_de_imagem'
  | 'analise_de_imagem'
  | 'outros'
  | 'atlas_civitas'
> & {
  anexos_gerais: TicketAttachmentOut[]
}

/** A API às vezes omite chaves com lista vazia; o app assume sempre arrays definidos. */
export function normalizeTicketServicosOut(
  data: Partial<TicketServicosOut> | null | undefined,
): TicketServicosOut {
  return {
    anexos_gerais: data?.anexos_gerais ?? [],
    busca_por_placa: data?.busca_por_placa ?? [],
    busca_por_radar: data?.busca_por_radar ?? [],
    cerco_eletronico: data?.cerco_eletronico ?? [],
    busca_por_imagem: data?.busca_por_imagem ?? [],
    placas_correlatas: data?.placas_correlatas ?? [],
    placas_conjuntas: data?.placas_conjuntas ?? [],
    reserva_de_imagem: data?.reserva_de_imagem ?? [],
    analise_de_imagem: data?.analise_de_imagem ?? [],
    outros: data?.outros ?? [],
    atlas_civitas: data?.atlas_civitas ?? [],
  }
}

export async function getTicketServicos(ticketId: string) {
  const { data } = await api.get<TicketServicosOut>(
    `/tickets/${ticketId}/servicos`,
  )
  return normalizeTicketServicosOut(data)
}

export async function replaceTicketServicos(
  ticketId: string,
  payload: TicketServicosReplaceIn,
) {
  const { data } = await api.put<TicketServicosOut>(
    `/tickets/${ticketId}/servicos`,
    payload,
  )
  return normalizeTicketServicosOut(data)
}
