import type { TicketDetection } from '@/http/tickets/get-ticket-by-id'

import type { TicketAttachmentCompleteIn } from './ticket-attachments'

/** Corpo JSON do PUT multipart `/tickets/{id}/services` (`payload`). */
export type TicketServicesUpsertIn = {
  plate_search: Array<{
    /** Omitir ou enviar só em itens já persistidos: com id = edição, sem id = criação. */
    id?: string
    completed?: boolean
    period_start?: string | null
    period_end?: string | null
    plates: string[]
  }>
  radar_search: Array<{
    id?: string
    completed?: boolean
    period_start?: string | null
    period_end?: string | null
    plates: string[]
    radar_address?: string | null
    orientation?: string | null
  }>
  electronic_fence: Array<{
    id?: string
    completed?: boolean
    plates: string[]
    vehicle_observations?: string | null
  }>
  image_search: Array<{
    id?: string
    completed?: boolean
    period_start?: string | null
    period_end?: string | null
    addresses?: string[]
    description?: string | null
    cameras?: string[]
  }>
  correlated_plates: Array<{
    id?: string
    completed?: boolean
    period_start?: string | null
    period_end?: string | null
    interest_interval_minutes?: number | null
    detection_count?: number | null
    detection?: TicketDetection | null
    plates: Array<{ plate?: string | null }>
  }>
  joint_plates: Array<{
    id?: string
    completed?: boolean
    period_start?: string | null
    period_end?: string | null
    interest_interval_minutes?: number | null
    detection_count?: number | null
    detection?: TicketDetection | null
    plates: Array<{ plate?: string | null }>
  }>
  image_reservation: Array<{
    id?: string
    completed?: boolean
    period_start?: string | null
    period_end?: string | null
    orientation?: string | null
    addresses?: string[]
    cameras?: string[]
  }>
  image_analysis: Array<{
    id?: string
    completed?: boolean
    period_start?: string | null
    period_end?: string | null
    orientation?: string | null
    addresses?: string[]
    cameras?: string[]
  }>
  other: Array<{
    id?: string
    completed?: boolean
    orientation?: string | null
  }>
  atlas_civitas: Array<{
    id?: string
    completed?: boolean
    name?: string | null
    email?: string | null
    cpf?: string | null
    registration?: string | null
  }>
  attachment_completes?: TicketAttachmentCompleteIn[]
}

/** @deprecated Use TicketServicesUpsertIn */
export type TicketServicesReplaceIn = TicketServicesUpsertIn

/** @deprecated Use TicketServicesUpsertIn */
export type TicketServicosReplaceIn = TicketServicesUpsertIn
