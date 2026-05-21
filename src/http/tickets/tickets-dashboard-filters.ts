import { api } from '@/lib/api'

export type SearchOption = {
  label: string
  value: string
}

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

type OperationSearchResponse = {
  id: string
  title: string
}

type OfficialLetterSearchResponse = {
  numero_oficio: string
}

type InternalNumberSearchResponse = {
  numero_interno: number
}

type ProcedureNumberSearchResponse = {
  numero_procedimento: string
}

type RequesterSearchResponse = {
  requisitante: string
}

type ResponsibleSearchResponse = {
  user_id: string
  user_name: string
}

type FocalPointSearchResponse = {
  ponto_focal: string
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
  const response = await api.get<OperationSearchResponse[]>(
    '/operations/search',
    {
      params: { search },
    },
  )

  return response.data.map((item) => ({
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
    label: item.numero_oficio,
    value: item.numero_oficio,
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
    label: String(item.numero_interno),
    value: String(item.numero_interno),
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
    label: item.numero_procedimento,
    value: item.numero_procedimento,
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
    label: item.requisitante,
    value: item.requisitante,
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
    label: item.ponto_focal,
    value: item.ponto_focal,
  }))
}
