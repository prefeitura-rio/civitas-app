'use server'

import { api } from '@/lib/api'
import type { GetReportsRequest } from '@/models/interfaces'
import { formatReportsRequest } from '@/utils/format-reports-request'
import { toQueryParams } from '@/utils/to-query-params'

type BackendTimelineGraphRecord = {
  data_report: string
  id_source: string
  count: number
}

export type TimelineGraphRecord = {
  date: string
  source: string
  count: number
}

export async function getTimelineReports(props: GetReportsRequest) {
  const newProps = formatReportsRequest(props)
  const query = toQueryParams(newProps)

  const response = await api.get<BackendTimelineGraphRecord[]>(
    `/reports/dashboard/timeline?${query.toString()}`,
  )

  const data: TimelineGraphRecord[] = response.data.map((item) => ({
    date: item.data_report,
    source: item.id_source,
    count: item.count,
  }))

  return data
}
