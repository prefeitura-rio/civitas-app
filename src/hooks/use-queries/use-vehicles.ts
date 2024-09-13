import { getBulkPlatesInfo } from "@/http/cars/plate/get-bulk-plates-info"
import { useQuery } from "@tanstack/react-query"

interface UseVehiclesProps {
  possiblePlates: string[]
  progress?: (progress: number) => void
}

export function useVehicles({possiblePlates, progress}: UseVehiclesProps) {
  return useQuery({
    queryKey: ['cortex', 'plate-info', ...possiblePlates],
    queryFn: async () => {
      return getBulkPlatesInfo(possiblePlates, (i) => progress?.(i))
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: possiblePlates.length > 0,
  })
}