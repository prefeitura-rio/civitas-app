import { useQuery } from '@tanstack/react-query'

import { getNCarsBeforeAfter } from '@/http/cars/n-before-after/get-n-cars-before-after'
import type { DetectionGroup } from '@/models/entities'

interface CarsBeforeAfter {
  plate: string
  startTime: string
  endTime: string
  nMinutes: number
  nPlates: number
  enabled?: boolean
}

const getRanking = (data: DetectionGroup[]) => {
  // Remove detections with less than 2 instances
  const plateCount = data
    .map((group) =>
      group.detections.filter(
        (detection, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.plate === detection.plate &&
              t.timestamp === detection.timestamp,
          ),
      ),
    )
    .flat()
    .filter((detection) => (detection.count ?? 0) > 1)
    .map((detection) => ({
      plate: detection.plate,
      count: detection.count,
    }))

  // Get unique plates
  const uniquePlateIntances = plateCount.filter(
    (detection, index, self) =>
      index === self.findIndex((t) => t.plate === detection.plate),
  )

  // Sort by instances
  const ranking = uniquePlateIntances.sort((a, b) => b.count - a.count)

  return ranking
}

export function useNCarsBeforeAfter({
  plate,
  startTime,
  endTime,
  nMinutes,
  nPlates,
  enabled = true,
}: CarsBeforeAfter) {
  return useQuery({
    queryKey: ['cars', plate, startTime, endTime, nMinutes, nPlates],
    queryFn: () =>
      getNCarsBeforeAfter({
        plate,
        startTime,
        endTime,
        nMinutes,
        nPlates,
      }).then((data) => {
        const ranking = getRanking(data)

        return {
          groups: data,
          ranking,
        }
      }),
    enabled,
  })
}
