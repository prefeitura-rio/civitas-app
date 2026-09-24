import { api } from '@/lib/api'
import type { MonitoredPlateHistoryItem } from '@/models/entities'
import type { PaginationResponse } from '@/models/pagination'

export type MonitoredPlateHistorySortBy =
  | 'activity_timestamp'
  | 'plate'
  | 'reference_number'
  | 'notes'
  | 'created_timestamp'
  | 'created_by'
  | 'deleted_timestamp'
  | 'deleted_by'

export type MonitoredPlateHistorySortDirection = 'asc' | 'desc'

export type MonitoredPlateHistoryStatusFilter = 'active' | 'deactivated'

export interface GetMonitoredPlatesHistoryProps {
  plate?: string
  startTimeCreate?: string
  endTimeCreate?: string
  startTimeDelete?: string
  endTimeDelete?: string
  status?: MonitoredPlateHistoryStatusFilter
  referenceNumber?: string
  requestingInstitutionId?: string
  institutionAuthorityId?: string
  page?: number
  size?: number
  sortBy?: MonitoredPlateHistorySortBy
  sortDirection?: MonitoredPlateHistorySortDirection
}

interface GetMonitoredPlatesHistoryResponse extends PaginationResponse {
  items: MonitoredPlateHistoryItem[]
}

export async function getMonitoredPlatesHistory(
  props: GetMonitoredPlatesHistoryProps,
) {
  const response = await api.get<GetMonitoredPlatesHistoryResponse>(
    '/cars/monitored/history',
    {
      params: {
        plate: props.plate,
        start_time_create: props.startTimeCreate,
        end_time_create: props.endTimeCreate,
        start_time_delete: props.startTimeDelete,
        end_time_delete: props.endTimeDelete,
        status: props.status,
        reference_number: props.referenceNumber,
        requesting_institution_id: props.requestingInstitutionId,
        institution_authority_id: props.institutionAuthorityId,
        page: props.page,
        size: props.size,
        sort_by: props.sortBy,
        sort_direction: props.sortDirection,
      },
    },
  )

  return response.data
}
