import { api } from '@/lib/api'
import type { GetReportsRequest } from '@/models/interfaces'
import { formatReportsRequest } from '@/utils/format-reports-request'
import { toQueryParams } from '@/utils/to-query-params'

export type BackendHeatmapCoordinates = {
  id_report: string
  latitude: number
  longitude: number
}

export type HeatmapCoordinates = {
  reportId: string
  latitude: number
  longitude: number
}

export async function getHeatmapReports(props: GetReportsRequest) {
  const newProps = formatReportsRequest(props)
  const query = toQueryParams(newProps)

  const response = await api.get<BackendHeatmapCoordinates[]>(
    `/reports/dashboard/map?${query.toString()}`,
  )

  const clusters: { [key: string]: number } = {}
  const data = response.data.map((item) => {
    const key = `${Math.floor(item.longitude * 10000)},${Math.floor(item.latitude * 10000)}`
    let lat = 0
    let lon = 0

    if (!clusters[key]) {
      lon = item.longitude
      lat = item.latitude
      clusters[key] = 1
    } else {
      clusters[key] += 1
      lon = item.longitude + 0.00001 * clusters[key]
      lat = item.latitude - 0.00001 * clusters[key]
    }

    return {
      reportId: item.id_report,
      latitude: lat,
      longitude: lon,
    } as HeatmapCoordinates
  })

  return data
}
