import { api } from '@/lib/api'
import type {
  BackendMonitoredPlate,
  MonitoredPlate,
  Operation,
} from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

interface GetMonitoredPlatesRequest extends PaginationRequest {
  operationId?: string
  operationTitle?: string
  notificationChannelId?: string
  notificationChannelTitle?: string
  plateContains?: string
  active?: boolean
  createdAtFrom?: string
  createdAtTo?: string
}

export interface GetMonitoredPlatesResponse extends PaginationResponse {
  items: MonitoredPlate[]
}

interface OriginalResponse extends PaginationResponse {
  items: BackendMonitoredPlate[]
}

export async function getMonitoredPlates({
  operationId,
  operationTitle,
  notificationChannelId,
  notificationChannelTitle,
  active,
  plateContains,
  page,
  size,
  createdAtFrom,
  createdAtTo,
}: GetMonitoredPlatesRequest) {
  const searchParams = new URLSearchParams()
  if (operationId) searchParams.set('operation_id', operationId)
  if (operationTitle) searchParams.set('operation_title', operationTitle)
  if (notificationChannelId)
    searchParams.set('notification_channel_id', notificationChannelId)
  if (notificationChannelTitle)
    searchParams.set('notification_channel_title', notificationChannelTitle)
  if (plateContains) searchParams.set('plate_contains', plateContains)
  if (typeof active !== 'undefined') searchParams.set('active', String(active))
  if (page) searchParams.set('page', String(page))
  if (size) searchParams.set('size', String(size))
  if (createdAtFrom) searchParams.set('start_time_create', createdAtFrom)
  if (createdAtTo) searchParams.set('end_time_create', createdAtTo)

  const originalResponse = await api.get<OriginalResponse>(
    `cars/monitored?${searchParams.toString()}`,
  )

  function toContactInfo(demandant: {
    email: string
    phone_1: string
    phone_2: string | null
    phone_3: string | null
  }) {
    const parts = [
      demandant.email,
      demandant.phone_1,
      demandant.phone_2,
      demandant.phone_3,
    ].filter((value): value is string => Boolean(value && value.trim()))

    return parts.length ? parts.join(', ') : null
  }

  function mapBackendItemToMonitoredPlate(item: BackendMonitoredPlate) {
    const demandantLinks = item.demandant_links

    // Novo formato: `demandant_links` + `radars`
    if (Array.isArray(demandantLinks) && demandantLinks.length > 0) {
      const selectedDemandantLink =
        demandantLinks.find((link) => link.active) ?? demandantLinks[0]

      const plateIsActive = demandantLinks.some((link) => link.active)

      return {
        id: item.id,
        plate: item.plate,
        notes: item.notes,
        active: plateIsActive,
        contactInfo: toContactInfo(selectedDemandantLink.demandant),
        demandantLinks,
        operation: {
          id: selectedDemandantLink.demandant.id,
          title: selectedDemandantLink.demandant.name,
          description: '',
        } as Operation,
        additionalInfo: selectedDemandantLink.additional_info,
        notificationChannels: (item.notification_channels ??
          []) as MonitoredPlate['notificationChannels'],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      } as MonitoredPlate
    }

    // Formato legado
    return {
      id: item.id,
      plate: item.plate,
      notes: item.notes,
      active: item.active ?? false,
      contactInfo: item.contact_info ?? null,
      operation: item.operation as Operation,
      additionalInfo: item.additional_info ?? ({} as JSON),
      notificationChannels: (item.notification_channels ??
        []) as MonitoredPlate['notificationChannels'],
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    } as MonitoredPlate
  }

  const items = originalResponse.data.items.map((item) =>
    mapBackendItemToMonitoredPlate(item),
  )

  const response = {
    ...originalResponse,
    data: {
      ...originalResponse.data,
      items,
    },
  }

  return response
}
