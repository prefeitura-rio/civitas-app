'use client'

import { useQuery } from '@tanstack/react-query'

import { useReportsSearchParams } from '@/hooks/useParams/useReportsSearchParams'
import { getTimelineReports } from '@/http/reports/dashboard/get-timeline'

export function useReportsTimeline() {
  const { queryKey, formattedSearchParams } = useReportsSearchParams()

  return useQuery({
    queryKey: ['reports-timeline', queryKey],
    queryFn: () => getTimelineReports(formattedSearchParams),
  })
}
