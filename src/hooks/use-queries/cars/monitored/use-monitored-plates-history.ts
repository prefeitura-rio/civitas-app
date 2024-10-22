import { useQuery } from '@tanstack/react-query'

import { useMonitoredPlatesHistorySearchParams } from '@/hooks/use-params/use-monitored-plates-history-search-params'
import { getMonitoredPlatesHistory } from '@/http/cars/monitored/get-monitored-plates-history'

export function useMonitoredPlatesHistory() {
  const { formattedSearchParams, queryKey } =
    useMonitoredPlatesHistorySearchParams()

  return useQuery({
    queryKey,
    queryFn: () => getMonitoredPlatesHistory(formattedSearchParams),
  })
}
