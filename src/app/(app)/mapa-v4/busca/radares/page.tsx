'use client'
import { useQuery } from '@tanstack/react-query'

import { Spinner } from '@/components/custom/spinner'
import { useCarRadarSearchParams } from '@/hooks/use-params/use-car-radar-search-params.'
import { useRadars } from '@/hooks/use-queries/use-radars'
import { getBulkPlatesInfo } from '@/http/cars/plate/get-plate-info-bulk'
import { getCarsByRadar } from '@/http/cars/radar/get-cars-by-radar'

import { DetectionsTable } from './components/detections-table'
import { RadarInfo } from './components/radar-info'

export default function RadarDetections() {
  const { formattedSearchParams, queryKey } = useCarRadarSearchParams()
  const { data: radars } = useRadars()

  const { data, isPending } = useQuery({
    queryKey,
    queryFn: () => {
      const radarIds = formattedSearchParams.radarIds

      const result = radarIds.map(async (cameraNumber) => {
        const detections = await getCarsByRadar({
          radar: cameraNumber,
          startTime: formattedSearchParams.from,
          endTime: formattedSearchParams.to,
          plateHint: formattedSearchParams.plate,
        })

        const vehicles = await getBulkPlatesInfo(
          detections.map((item) => item.plate),
        )

        const joinedData = detections.map((detection) => {
          const vehicle = vehicles.find(
            (vehicle) => vehicle.plate === detection.plate,
          )
          if (!vehicle) throw Error(`Vehicle ${detection.plate} not found`)
          return {
            ...detection,
            ...vehicle,
          }
        })

        const radar = radars?.find((item) => item.cameraNumber === cameraNumber)
        if (!radar) throw Error(`Radar ${cameraNumber} not found`)

        return {
          radar,
          detections: joinedData,
        }
      })

      return Promise.all(result)
    },
    enabled: !!radars,
  })

  return (
    <div className="h-full overflow-y-scroll p-2">
      {isPending && (
        <div className="flex w-full justify-center p-6">
          <Spinner className="size-10" />
        </div>
      )}
      {data?.map((item) => (
        <div key={item.radar?.cameraNumber} className="space-y-4">
          <RadarInfo radar={item.radar} />
          <DetectionsTable data={item.detections} isLoading={isPending} />
        </div>
      ))}
    </div>
  )
}
