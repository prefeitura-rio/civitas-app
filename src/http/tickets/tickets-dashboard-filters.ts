import { searchOperationsPaginated } from '@/http/operations/search-operations'
import { api } from '@/lib/api'

export type SearchOption = {
  label: string

  value: string
}

export type TicketDashboardServiceFilter =
  | 'plate_search_services'
  | 'radar_search_services'
  | 'electronic_fence_services'
  | 'image_search_services'
  | 'correlated_plate_services'
  | 'joint_plate_services'
  | 'image_reservation_services'
  | 'image_analysis_services'
  | 'other_services'
  | 'atlas_civitas_services'

/** Labels em português; `value` é o enviado no body (`services`). */
export const TICKET_DASHBOARD_SERVICE_FILTER_OPTIONS: SearchOption[] = [
  { value: 'plate_search_services', label: 'Busca por placa' },
  { value: 'radar_search_services', label: 'Busca por radar' },
  { value: 'electronic_fence_services', label: 'Cerco eletrônico' },
  { value: 'image_search_services', label: 'Busca por imagem' },
  { value: 'correlated_plate_services', label: 'Placas correlatas' },
  { value: 'joint_plate_services', label: 'Placas conjuntas' },
  { value: 'image_reservation_services', label: 'Reserva de imagem' },
  { value: 'image_analysis_services', label: 'Análise de imagem' },
  { value: 'other_services', label: 'Outros' },
  { value: 'atlas_civitas_services', label: 'Atlas Civitas' },
]

type TicketTypeItem = {
  id: string

  name: string
}

type TicketNatureItem = {
  id: string

  name: string
}

type TicketTypePageResponse = {
  items: TicketTypeItem[]
}

type TicketNaturePageResponse = {
  items: TicketNatureItem[]
}

type OfficialLetterSearchResponse = {
  official_letter_number: string
}

type InternalNumberSearchResponse = {
  internal_number: number
}

type ProcedureNumberSearchResponse = {
  procedure_number: string
}

type RequesterSearchResponse = {
  requester: string
}

type ResponsibleSearchResponse = {
  user_id: string

  user_name: string
}

type FocalPointSearchResponse = {
  focal_point: string
}

function normalizeTicketTypeItems(
  data: TicketTypePageResponse | TicketTypeItem[],
): TicketTypeItem[] {
  if (Array.isArray(data)) return data

  return data.items ?? []
}

export async function searchTicketTypes(
  search: string,
): Promise<SearchOption[]> {
  const response = await api.get<TicketTypePageResponse | TicketTypeItem[]>(
    '/ticket-types',

    {
      params: {
        search,

        isActive: true,
      },
    },
  )

  return normalizeTicketTypeItems(response.data).map((item) => ({
    label: item.name,

    value: item.id,
  }))
}

function normalizeTicketNatureItems(
  data: TicketNaturePageResponse | TicketNatureItem[],
): TicketNatureItem[] {
  if (Array.isArray(data)) return data

  return data.items ?? []
}

export async function searchTicketNatures(
  search: string,
): Promise<SearchOption[]> {
  const response = await api.get<TicketNaturePageResponse | TicketNatureItem[]>(
    '/ticket-natures',

    {
      params: {
        search,

        isActive: true,
      },
    },
  )

  return normalizeTicketNatureItems(response.data).map((item) => ({
    label: item.name,

    value: item.id,
  }))
}

export async function searchOperations(
  search: string,
): Promise<SearchOption[]> {
  const data = await searchOperationsPaginated({
    search,
    page: 1,
    size: 20,
  })

  return data.items.map((item) => ({
    label: item.title,

    value: item.id,
  }))
}

export async function searchOfficialLetters(
  search: string,
): Promise<SearchOption[]> {
  const response = await api.get<OfficialLetterSearchResponse[]>(
    '/tickets/official-letters/search',

    {
      params: { search },
    },
  )

  return response.data.map((item) => ({
    label: item.official_letter_number,

    value: item.official_letter_number,
  }))
}

export async function searchInternalNumbers(
  search: string,
): Promise<SearchOption[]> {
  const response = await api.get<InternalNumberSearchResponse[]>(
    '/tickets/internal-numbers/search',

    {
      params: { search },
    },
  )

  return response.data.map((item) => ({
    label: String(item.internal_number),

    value: String(item.internal_number),
  }))
}

export async function searchProcedureNumbers(
  search: string,
): Promise<SearchOption[]> {
  const response = await api.get<ProcedureNumberSearchResponse[]>(
    '/tickets/procedure-numbers/search',

    {
      params: { search },
    },
  )

  return response.data.map((item) => ({
    label: item.procedure_number,

    value: item.procedure_number,
  }))
}

export async function searchRequesters(
  search: string,
): Promise<SearchOption[]> {
  const response = await api.get<RequesterSearchResponse[]>(
    '/tickets/requesters/search',

    {
      params: { search },
    },
  )

  return response.data.map((item) => ({
    label: item.requester,

    value: item.requester,
  }))
}

export async function searchTicketResponsibles(
  search: string,
): Promise<SearchOption[]> {
  const response = await api.get<ResponsibleSearchResponse[]>(
    '/tickets/responsibles/search',

    {
      params: { search },
    },
  )

  return response.data.map((item) => ({
    label: item.user_name,

    value: item.user_id,
  }))
}

export async function searchFocalPoints(
  search: string,
): Promise<SearchOption[]> {
  const response = await api.get<FocalPointSearchResponse[]>(
    '/tickets/focal-points/search',

    {
      params: { search },
    },
  )

  return response.data.map((item) => ({
    label: item.focal_point,

    value: item.focal_point,
  }))
}
