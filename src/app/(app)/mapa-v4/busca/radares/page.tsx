'use client'
import { useQuery } from '@tanstack/react-query'

import { Spinner } from '@/components/custom/spinner'
import { useCarRadarSearchParams } from '@/hooks/use-params/use-car-radar-search-params.'
import { useRadars } from '@/hooks/use-queries/use-radars'
// import { getBulkPlatesInfo } from '@/http/cars/plate/get-plate-info-bulk'
import { getCarsByRadar } from '@/http/cars/radar/get-cars-by-radar'
import type { Radar, RadarDetection, Vehicle } from '@/models/entities'

import { DetectionsTable } from './components/detections-table'
// import { DownloadReport } from './components/download-report'
import { RadarsInfo } from './components/radars-info'

export default function RadarDetections() {
  const { formattedSearchParams, queryKey } = useCarRadarSearchParams()
  const { data: radars } = useRadars()

  const { data, isPending } = useQuery({
    queryKey,
    queryFn: async () => {
      if (
        !formattedSearchParams.date ||
        !formattedSearchParams.radarIds ||
        !formattedSearchParams.duration
      ) {
        throw new Error('Missing required parameters')
      }

      const radarIds = formattedSearchParams.radarIds
      const startTime = new Date(formattedSearchParams.date)
        .addMinutes(formattedSearchParams.duration[0])
        .toISOString()
      const endTime = new Date(formattedSearchParams.date)
        .addMinutes(formattedSearchParams.duration[1])
        .toISOString()
      const plateHint = formattedSearchParams.plateHint

      const _radars =
        radars?.filter(
          (radar) =>
            radarIds.includes(radar.cameraNumber) ||
            (radar.cetRioCode && radarIds.includes(radar?.cetRioCode)),
        ) || []

      const result = await Promise.all(
        _radars.map(async (radar) => {
          const detections = await getCarsByRadar({
            radar: radar.cameraNumber,
            startTime,
            endTime,
            plateHint,
          })

          // const vehicles = await getBulkPlatesInfo(
          //   detections.map((item) => item.plate),
          // )

          const joinedData = detections.map((detection) => {
            // const vehicle = vehicles.find(
            //   (vehicle) => vehicle.plate === detection.plate,
            // )
            // if (!vehicle) throw Error(`Vehicle ${detection.plate} not found`)
            return {
              ...detection,
              // ...vehicle,
              color: '',
              brandModel: '',
              modelYear: '',
              cameraNumber: radar.cameraNumber,
              lane: radar.lane || '',
            }
          })

          return {
            radar,
            detections: joinedData,
          }
        }),
      )

      const groupedData = result.reduce(
        (acc, item) => {
          const location = item.radar.location?.replace(/- FX \d+/, '') || 'N/A'
          if (!acc[location]) {
            acc[location] = {
              location,
              radars: [],
              detections: [],
            }
          }
          acc[location].radars.push(item.radar)
          acc[location].detections.push(
            ...item.detections.map((detection) => ({
              ...detection,
              lane: detection.lane || 'N/A',
            })),
          )
          return acc
        },
        {} as {
          [key: string]: {
            location: string
            radars: Radar[]
            detections: (RadarDetection &
              Vehicle & {
                cameraNumber: string
                lane: string
              })[]
          }
        },
      )

      Object.values(groupedData).forEach((group) => {
        group.detections.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )
      })

      return Object.values(groupedData)
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
      {data &&
        data.map((item) => (
          <div key={item.location} className="relative space-y-4">
            <div className="absolute right-2 top-0">
              {/* <DownloadReport
                data={data}
                parameters={{
                  from: new Date(formattedSearchParams.date || ''),
                  to: new Date(formattedSearchParams.date || ''),
                  plateHint: formattedSearchParams.plateHint,
                  radarIds: formattedSearchParams.radarIds || [],
                }}
              /> */}
            </div>
            <RadarsInfo location={item.location} />
            <DetectionsTable data={item} isLoading={isPending} />
          </div>
        ))}
    </div>
  )
}
