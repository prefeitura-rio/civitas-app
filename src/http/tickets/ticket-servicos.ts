import { api } from '@/lib/api'

import type { TicketOut } from './get-ticket-by-id'
import type {
  TicketAttachmentOut,
  TicketAttachmentServiceScopeMetadataIn,
} from './ticket-attachments'
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

/** PUT multipart: `payload` (JSON) + `files` + `attachment_metadata`, como em POST `/tickets`. */
export async function replaceTicketServicos(
  ticketId: string,
  payload: TicketServicesUpsertIn,
  files: File[] = [],
  attachmentMetadata: TicketAttachmentServiceScopeMetadataIn[] = [],
) {
  const form = new FormData()
  form.append('payload', JSON.stringify(payload))
  for (const f of files) {
    form.append('files', f)
  }
  if (attachmentMetadata.length > 0) {
    form.append('attachment_metadata', JSON.stringify(attachmentMetadata))
  }

  const { data } = await api.put<TicketServicesOut>(
    `/tickets/${ticketId}/services`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return normalizeTicketServicosOut(data)
}

export {
  getTicketServicos as getTicketServices,
  replaceTicketServicos as replaceTicketServices,
}
