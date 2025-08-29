import { useQuery } from '@tanstack/react-query'

import { useMonitoredPlatesHistorySearchParams } from '@/hooks/useParams/useMonitoredPlatesHistorySearchParams'
import { getMonitoredPlatesHistory } from '@/http/cars/monitored/get-monitored-plates-history'

export function useMonitoredPlatesHistory() {
  const { formattedSearchParams, queryKey } =
    useMonitoredPlatesHistorySearchParams()

  return useQuery({
    queryKey,
    queryFn: () => getMonitoredPlatesHistory(formattedSearchParams),
  })
}
