import { api } from '@/lib/api'
import type { GetReportsRequest } from '@/models/interfaces'
import { formatReportsRequest } from '@/utils/format-reports-request'
import { toQueryParams } from '@/utils/to-query-params'

type BackendTop5GraphRecord = {
  tipo: string
  subtipo: string
  count: number
}

export type Top5GraphRecord = {
  type: string
  subtype: string
  count: number
}

export async function getTopSubtypes(props: GetReportsRequest) {
  const newProps = formatReportsRequest(props)
  const query = toQueryParams(newProps)

  const response = await api.get<BackendTop5GraphRecord[]>(
    `/reports/dashboard/top-subtypes?${query.toString()}`,
  )

  const data: Top5GraphRecord[] = response.data.map((item) => ({
    type: item.tipo,
    subtype: item.subtipo,
    count: item.count,
  }))

  return data
}
