'use client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { Spinner } from '@/components/custom/spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useCarRadarSearchParams } from '@/hooks/use-params/use-car-radar-search-params.'
import { useRadars } from '@/hooks/use-queries/use-radars'
// import { getBulkPlatesInfo } from '@/http/cars/plate/get-plate-info-bulk'
import { getCarsByRadar } from '@/http/cars/radar/get-cars-by-radar'
import type { Radar, RadarDetection, Vehicle } from '@/models/entities'

import { DetectionsTable } from './components/detections-table'
import { DownloadReport } from './components/download-report'

export default function RadarDetections() {
  const { formattedSearchParams, queryKey } = useCarRadarSearchParams()
  const router = useRouter()
  const { data: radars } = useRadars()

  const { data, isPending } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!formattedSearchParams) {
        throw new Error('Missing required parameters')
      }

      const radarIds = formattedSearchParams.radarIds
      const startTime = new Date(formattedSearchParams.date)
        .addMinutes(formattedSearchParams.duration[0])
        .toISOString()
      const endTime = new Date(formattedSearchParams.date)
        .addMinutes(formattedSearchParams.duration[1])
        .toISOString()
      const plateHint = formattedSearchParams.plate

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
    enabled: !!radars && !!formattedSearchParams,
  })

  if (!formattedSearchParams) {
    return (
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Parâmetros Inválidos</AlertDialogTitle>
            <AlertDialogDescription>
              Os parâmetros de busca são inválidos. Volte para o mapa e tente
              realizar a busca novamente pelo painel de busca.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => router.push('/mapa')}>
                Voltar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <div className="h-full overflow-y-scroll p-2">
      {isPending && (
        <div className="flex w-full justify-center p-6">
          <Spinner className="size-10" />
        </div>
      )}
      {data && (
        <div className="relative">
          <div className="absolute right-2 top-0 z-10">
            <DownloadReport
              data={data}
              parameters={{
                from: new Date(formattedSearchParams.date),
                to: new Date(formattedSearchParams.date),
                plateHint: formattedSearchParams.plate,
                radarIds: formattedSearchParams.radarIds,
              }}
            />
          </div>
          {data.map((item) => (
            <div key={item.location} className="relative mb-10 space-y-4">
              <h4 className="">{item.location}</h4>
              <DetectionsTable data={item} isLoading={isPending} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
