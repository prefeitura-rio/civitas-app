import { api } from '@/lib/api'
import type { GetReportsRequest } from '@/models/interfaces'
import { formatReportsRequest } from '@/utils/format-reports-request'
import { toQueryParams } from '@/utils/to-query-params'

export type HeatmapCoordinates = {
  latitude: number
  longitude: number
}

export async function getHeatmapReports(props: GetReportsRequest) {
  const newProps = formatReportsRequest(props)
  const query = toQueryParams(newProps)

  const response = await api.get<HeatmapCoordinates[]>(
    `/reports/dashboard/map?${query.toString()}`,
  )

  return response.data
}
