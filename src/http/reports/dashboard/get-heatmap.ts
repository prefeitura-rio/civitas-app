import { api } from '@/lib/api'
import type { GetReportsRequest } from '@/models/interfaces'
import { formatReportsRequest } from '@/utils/format-reports-request'
import { isValidGeographicCoordinates } from '@/utils/geographic-coordinates'
import { toQueryParams } from '@/utils/to-query-params'

export type BackendHeatmapCoordinates = {
  id_report: string
  latitude: number | null
  longitude: number | null
}

export type HeatmapCoordinates = {
  reportId: string
  latitude: number
  longitude: number
}

/**
 * Fetches occurrence coordinates and offsets duplicates for display.
 * Invalid coordinates are omitted before arithmetic so missing values cannot
 * be coerced into a fabricated point near [0, 0].
 */
export async function getHeatmapReports(props: GetReportsRequest) {
  const newProps = formatReportsRequest(props)
  const query = toQueryParams(newProps)

  const response = await api.get<BackendHeatmapCoordinates[]>(
    `/reports/dashboard/map?${query.toString()}`,
  )

  const clusters: { [key: string]: number } = {}
  const data = response.data
    .filter(
      (
        item,
      ): item is BackendHeatmapCoordinates & {
        longitude: number
        latitude: number
      } => isValidGeographicCoordinates([item.longitude, item.latitude]),
    )
    .map((item) => {
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

      if (!isValidGeographicCoordinates([lon, lat])) {
        lon = item.longitude
        lat = item.latitude
      }

      return {
        reportId: item.id_report,
        latitude: lat,
        longitude: lon,
      } as HeatmapCoordinates
    })

  return data
}
