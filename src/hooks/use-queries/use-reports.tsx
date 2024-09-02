import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { getReports } from '@/http/reports/get-reports'
import type { Report } from '@/models/entities'

import { useReportsSearchParams } from '../use-params/use-reports-search-params'

export function useReports() {
  const [consumedPages, setConsumedPages] = useState(1)
  const [all, setAll] = useState<Report[] | undefined>()
  const { queryKey, formattedSearchParams } = useReportsSearchParams()

  const { data } = useQuery({
    queryKey,
    queryFn: () => getReports(formattedSearchParams),
  })

  useEffect(() => {
    if (data?.pages && data.pages > consumedPages) {
      setAll((prev) => (prev ? [...prev, ...data.items] : data.items))
    }
  }, [formattedSearchParams, data])
}
