'use client'

import { useQuery } from '@tanstack/react-query'

import { useReportsSearchParams } from '@/hooks/use-params/use-reports-search-params'
import { getTimelineReports } from '@/http/reports/dashboard/get-timeline'

export function useReportsTimeline() {
  const { queryKey, formattedSearchParams } = useReportsSearchParams()

  return useQuery({
    queryKey: ['reports-timeline', queryKey],
    queryFn: () => getTimelineReports(formattedSearchParams),
  })
}
