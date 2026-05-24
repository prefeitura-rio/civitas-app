import type { TicketDetection } from '@/http/tickets/get-ticket-by-id'

/** Corpo do PUT /tickets/{id}/servicos — alinhado a TicketServicosReplaceIn (API). */
export type TicketServicosReplaceIn = {
  busca_por_placa: Array<{
    /** Omitir ou enviar só em itens já persistidos: com id = edição, sem id = criação. */
    id?: string
    concluido?: boolean
    period_start?: string | null
    period_end?: string | null
    plates: string[]
  }>
  busca_por_radar: Array<{
    id?: string
    concluido?: boolean
    period_start?: string | null
    period_end?: string | null
    plates: string[]
    radar_address?: string | null
    orientation?: string | null
  }>
  cerco_eletronico: Array<{
    id?: string
    concluido?: boolean
    plate?: string | null
    vehicle_observations?: string | null
  }>
  busca_por_imagem: Array<{
    id?: string
    concluido?: boolean
    period_start?: string | null
    period_end?: string | null
    plate?: string | null
    address?: string | null
    description?: string | null
    cameras?: string[]
  }>
  placas_correlatas: Array<{
    id?: string
    concluido?: boolean
    period_start?: string | null
    period_end?: string | null
    interest_interval_minutes?: number | null
    detection_count?: number | null
    detection?: TicketDetection | null
    plates: Array<{ plate?: string | null }>
  }>
  placas_conjuntas: Array<{
    id?: string
    concluido?: boolean
    period_start?: string | null
    period_end?: string | null
    interest_interval_minutes?: number | null
    detection_count?: number | null
    detection?: TicketDetection | null
    plates: Array<{ plate?: string | null }>
  }>
  reserva_de_imagem: Array<{
    id?: string
    concluido?: boolean
    period_start?: string | null
    period_end?: string | null
    orientation?: string | null
    cameras?: string[]
  }>
  analise_de_imagem: Array<{
    id?: string
    concluido?: boolean
    period_start?: string | null
    period_end?: string | null
    orientation?: string | null
    cameras?: string[]
  }>
  outros: Array<{
    id?: string
    concluido?: boolean
    orientation?: string | null
  }>
}
