import { api } from '@/lib/api'

import type { TicketOut } from './get-ticket-by-id'
import type { TicketAttachmentOut } from './ticket-attachments'
import type { TicketServicesUpsertIn } from './ticket-servicos-types'

/** Mesmo formato dos campos de serviços em TicketOut + anexos sem serviço (GET `/services` enriquecido). */
export type TicketServicesOut = Pick<
  TicketOut,
  | 'plate_search'
  | 'radar_search'
  | 'electronic_fence'
  | 'image_search'
  | 'correlated_plates'
  | 'joint_plates'
  | 'image_reservation'
  | 'image_analysis'
  | 'other'
  | 'atlas_civitas'
> & {
  general_attachments: TicketAttachmentOut[]
}

/** @deprecated Use TicketServicesOut */
export type TicketServicosOut = TicketServicesOut

/** A API às vezes omite chaves com lista vazia; o app assume sempre arrays definidos. */
export function normalizeTicketServicosOut(
  data: Partial<TicketServicesOut> | null | undefined,
): TicketServicesOut {
  return {
    general_attachments: data?.general_attachments ?? [],
    plate_search: data?.plate_search ?? [],
    radar_search: data?.radar_search ?? [],
    electronic_fence: data?.electronic_fence ?? [],
    image_search: data?.image_search ?? [],
    correlated_plates: data?.correlated_plates ?? [],
    joint_plates: data?.joint_plates ?? [],
    image_reservation: data?.image_reservation ?? [],
    image_analysis: data?.image_analysis ?? [],
    other: data?.other ?? [],
    atlas_civitas: data?.atlas_civitas ?? [],
  }
}

export async function getTicketServicos(ticketId: string) {
  const { data } = await api.get<TicketServicesOut>(
    `/tickets/${ticketId}/services`,
  )
  return normalizeTicketServicosOut(data)
}

export async function replaceTicketServicos(
  ticketId: string,
  payload: TicketServicesUpsertIn,
) {
  const { data } = await api.put<TicketServicesOut>(
    `/tickets/${ticketId}/services`,
    payload,
  )
  return normalizeTicketServicosOut(data)
}

export {
  getTicketServicos as getTicketServices,
  replaceTicketServicos as replaceTicketServices,
}
