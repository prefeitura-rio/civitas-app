import { api } from '@/lib/api'

import type { TicketAttachmentOut } from './ticket-attachments'

export type TicketPriorityOut = 'URGENTE' | 'ALTA' | 'ROTINA'

export type TicketRequesterOut = {
  name: string
  phone?: string | null
  email: string
}

export type TicketFocalPointOut = {
  name: string
  phone?: string | null
  email?: string | null
}

export type ServicePlateSearchPlateOut = {
  id: string
  created_at: string
  plate: string
}

export type ServicePlateSearchOut = {
  id: string
  created_at: string
  /** Quando true, exige todos os campos do serviço preenchidos (validação no cliente). */
  completed?: boolean
  period_start?: string | null
  period_end?: string | null
  plates: ServicePlateSearchPlateOut[]
  attachments?: TicketAttachmentOut[]
}

export type ServiceRadarSearchPlateOut = {
  id: string
  created_at: string
  plate: string
}

export type ServiceRadarSearchOut = {
  id: string
  created_at: string
  completed?: boolean
  period_start?: string | null
  period_end?: string | null
  plates: ServiceRadarSearchPlateOut[]
  radar_address?: string | null
  orientation?: string | null
  attachments?: TicketAttachmentOut[]
}

export type ServiceElectronicFencePlateOut = {
  id: string
  created_at: string
  plate: string
}

export type ServiceElectronicFenceOut = {
  id: string
  created_at: string
  completed?: boolean
  plates: ServiceElectronicFencePlateOut[]
  vehicle_observations?: string | null
  attachments?: TicketAttachmentOut[]
}

export type ServiceCameraOut = {
  id: string
  created_at: string
  camera_code: string
}

export type ServiceAddressOut = {
  id: string
  created_at: string
  address: string
}

export type ServiceImageSearchOut = {
  id: string
  created_at: string
  completed?: boolean
  period_start?: string | null
  period_end?: string | null
  addresses?: ServiceAddressOut[]
  description?: string | null
  cameras?: ServiceCameraOut[]
  attachments?: TicketAttachmentOut[]
}

export type ServiceCorrelatedPlatesItemOut = {
  id: string
  created_at: string
  plate?: string | null
}

export type TicketDetection = 'ANTES' | 'DEPOIS' | 'AMBOS'

export type ServiceCorrelatedPlatesOut = {
  id: string
  created_at: string
  completed?: boolean
  period_start?: string | null
  period_end?: string | null
  interest_interval_minutes?: number | null
  detection_count?: number | null
  detection?: TicketDetection | null
  plates: ServiceCorrelatedPlatesItemOut[]
  attachments?: TicketAttachmentOut[]
}

export type ServiceJointPlatesOut = {
  id: string
  created_at: string
  completed?: boolean
  period_start?: string | null
  period_end?: string | null
  interest_interval_minutes?: number | null
  detection_count?: number | null
  detection?: TicketDetection | null
  plates: ServiceCorrelatedPlatesItemOut[]
  attachments?: TicketAttachmentOut[]
}

export type ServiceImageReservationOut = {
  id: string
  created_at: string
  completed?: boolean
  period_start?: string | null
  period_end?: string | null
  orientation?: string | null
  addresses?: ServiceAddressOut[]
  cameras?: ServiceCameraOut[]
  attachments?: TicketAttachmentOut[]
}

export type ServiceImageAnalysisOut = {
  id: string
  created_at: string
  completed?: boolean
  period_start?: string | null
  period_end?: string | null
  orientation?: string | null
  addresses?: ServiceAddressOut[]
  cameras?: ServiceCameraOut[]
  attachments?: TicketAttachmentOut[]
}

export type ServiceOtherOut = {
  id: string
  created_at: string
  completed?: boolean
  orientation?: string | null
  attachments?: TicketAttachmentOut[]
}

export type ServiceAtlasCivitasOut = {
  id: string
  created_at: string
  completed?: boolean
  name?: string | null
  email?: string | null
  cpf?: string | null
  registration?: string | null
  attachments?: TicketAttachmentOut[]
}

export type TicketCommentOut = {
  id: string
  created_at: string
  author_id?: string | null
  body: string
}

export type TicketRelatedOut = {
  id: string
  internal_number: number
  team?: string | null
  assignee?: string | null
  status: string
  services: string[]
}

export type TicketOut = {
  id: string
  created_at: string
  /** Presente nas versões recentes da API (cabeçalho do detalhe). */
  internal_number?: number
  status?: string
  requester_operation?: string
  team?: string | null
  assignee?: string | null
  open_days?: number
  linked_ticket_id?: string | null
  ticket_type_id: string
  ticket_type_name?: string
  nature_name?: string | null
  operation_id?: string | null
  procedure_number?: string | null
  official_letter_number?: string | null
  base_date?: string | null
  nature_id?: string | null
  has_press_alias: boolean
  press_alias?: string | null
  article_link?: string | null
  requester: TicketRequesterOut
  focal_points: TicketFocalPointOut[]
  team_id?: string | null
  priority?: TicketPriorityOut | null
  comments?: TicketCommentOut[]
  attachments?: TicketAttachmentOut[]
  plate_search: ServicePlateSearchOut[]
  radar_search: ServiceRadarSearchOut[]
  electronic_fence: ServiceElectronicFenceOut[]
  image_search: ServiceImageSearchOut[]
  correlated_plates: ServiceCorrelatedPlatesOut[]
  joint_plates: ServiceJointPlatesOut[]
  image_reservation: ServiceImageReservationOut[]
  image_analysis: ServiceImageAnalysisOut[]
  other: ServiceOtherOut[]
  atlas_civitas: ServiceAtlasCivitasOut[]
  related_tickets?: TicketRelatedOut[]
}

export async function getTicketById(ticketId: string) {
  const { data } = await api.get<TicketOut>(`/tickets/${ticketId}`)
  return data
}
