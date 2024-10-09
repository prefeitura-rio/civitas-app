import { pdf } from '@react-pdf/renderer'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog'
import { Progress } from '@/components/ui/progress'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { useCarPathsSearchParams } from '@/hooks/use-params/use-car-paths-search-params'
import { useRadars } from '@/hooks/use-queries/use-radars'
import { getCarsByRadar } from '@/http/cars/radar/get-cars-by-radar'
import type { Radar } from '@/models/entities'

import {
  type ReportData,
  ReportDocument,
} from '../../reports-by-detection-point/components/report/document'

interface DownloadReportsByDetectionPointButtonProps {
  open: boolean
  setOpen: (open: boolean) => void
  interval: number
}

export default function JointPlatesReportDownloadProgressAlert({
  open,
  setOpen,
  interval,
}: DownloadReportsByDetectionPointButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const countRef = useRef(0)
  const downloadInitiatedRef = useRef(false)

  const {
    layers: {
      trips: { trips },
    },
  } = useMap()
  const { formattedSearchParams } = useCarPathsSearchParams()
  if (!formattedSearchParams)
    throw new Error('formattedSearchParams is required')

  const { data: radars } = useRadars()

  const getReportData = useCallback(async () => {
    if (!trips) throw new Error('trips is required')
    if (!radars) throw new Error('radars is required')

    const points = trips.map((trip) => trip.points).flat()

    const pointsAndRadarGroups = points.map((point) => {
      const pointUniqueLocation = `${point.location?.replace(/ - FX .*/, '')?.replace(/ - SENTIDO .*/, '')} ${point.direction} ${point.district}`
      const group = radars.filter((radar) => {
        const radarUniqueLocation = `${radar.location
          ?.replace(/ - SENTIDO .*/, '')
          ?.replace(/ - FX .*/, '')} ${radar.direction} ${radar.district}`
        return (
          radarUniqueLocation.replaceAll(' ', '').toUpperCase() ===
          pointUniqueLocation.replaceAll(' ', '').toUpperCase()
        )
      })
      const filteredGroup = group.reduce((acc, radar) => {
        if (!acc.some((r) => r.cameraNumber === radar.cameraNumber)) {
          acc.push(radar)
        }
        return acc
      }, [] as Radar[])

      return {
        point,
        radars: filteredGroup,
      }
    })

    // const detectionsByGroup: Omit<ReportData, 'instances'> = []
    const total = pointsAndRadarGroups.reduce(
      (acc, group) => acc + group.radars.length,
      0,
    )

    const allDetectionsPromises = pointsAndRadarGroups.flatMap(
      ({ point, radars }) => {
        const startTime = new Date(point.startTime)
          .addMinutes(-1 * interval)
          .toISOString()
        const endTime = new Date(point.startTime)
          .addMinutes(interval)
          .toISOString()

        return radars.map(async (radar) => {
          const detections = await getCarsByRadar({
            radar: radar.cameraNumber,
            startTime,
            endTime,
          })

          const joinedData = detections.map((detection) => ({
            ...detection,
            cameraNumber: radar.cameraNumber,
            lane: radar.lane || '',
            location: radar.location?.replace(/- FX \d+/, '') || '',
          }))

          countRef.current = countRef.current + 1
          setProgress(countRef.current / total)

          return {
            point,
            radar,
            detections: joinedData,
          }
        })
      },
    )

    const allDetections = await Promise.all(allDetectionsPromises)

    const detectionsByGroup: Omit<ReportData, 'instances'> =
      pointsAndRadarGroups.map(({ point, radars }) => {
        const groupDetections = allDetections
          .filter(
            (detection) =>
              detection.point === point && radars.includes(detection.radar),
          )
          .flatMap((detection) => detection.detections)

        const sortedDetections = groupDetections.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )

        return {
          detections: sortedDetections.map((d) => ({ ...d, count: 0 })),
          from: new Date(point.startTime)
            .addMinutes(-1 * interval)
            .toISOString(),
          to: new Date(point.startTime).addMinutes(interval).toISOString(),
          monitoredPlateTimestamp: point.startTime,
          groupLocation: `${point.location?.replace(/ - FX .*/, '') || ''}, ${
            point.district
          } - ${point.direction}`,
          latitude: radars.at(0)?.latitude || 0,
          longitude: radars.at(0)?.longitude || 0,
          totalDetections: sortedDetections.length,
          radarIds: radars.map((radar) => radar.cameraNumber),
        }
      })

    // Count plates
    const plateCount: Record<string, number> = {}
    detectionsByGroup
      .flatMap((group) => group.detections)
      .forEach((detection) => {
        if (plateCount[detection.plate]) {
          plateCount[detection.plate] += 1
        } else {
          plateCount[detection.plate] = 1
        }
      })

    // Adiciona instância de cada placa à detecção
    const detectionsByGroupWithCount = detectionsByGroup.map((group) => ({
      ...group,
      detections: group.detections.map((detection) => ({
        ...detection,
        count: plateCount[detection.plate],
      })),
    }))

    // Retorna uma lista de grupos de detecções
    return detectionsByGroupWithCount
  }, [trips, radars])

  const getRanking = (data: ReportData) => {
    // Remove detections with less than 2 instances
    const plateCount = data
      .map((group) => group.detections)
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

  async function handleDownload() {
    if (!formattedSearchParams)
      throw new Error('formattedSearchParams is required')
    if (!trips) throw new Error('trips is required')
    if (!radars) throw new Error('radars is required')

    setIsLoading(true)
    // const { data, ranking } = await getReportData(trips, radars)
    const data = await getReportData()
    const ranking = getRanking(data)
    console.log({ data, ranking })
    const blob = await pdf(
      <ReportDocument
        params={{
          plate: formattedSearchParams.plate,
          startTime: formattedSearchParams.from,
          endTime: formattedSearchParams.to,
        }}
        data={data}
        ranking={ranking}
      />,
    ).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `placas_conjuntas_${formattedSearchParams.plate}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    setIsLoading(false)
    countRef.current = 0
    setProgress(0)
    setOpen(false)
  }

  useEffect(() => {
    if (!downloadInitiatedRef.current) {
      downloadInitiatedRef.current = true
      console.log('debug')
      handleDownload()
    }
  }, [open])

  return (
    <div>
      {/* <Tooltip
        asChild
        text="Relatório de placas conjuntas"
        disabled={isLoading || !trips || !radars || isTripsLoading}
      >
        <span tabIndex={0}>
          <Button
            variant="secondary"
            size="icon"
            disabled={isLoading || !trips || !radars || isTripsLoading}
            onClick={handleDownload}
          >
            {isLoading ? (
              <Spinner className="size-4 shrink-0" />
            ) : (
              <Printer className="size-4 shrink-0" />
            )}
          </Button>
        </span>
      </Tooltip> */}
      <AlertDialog open={isLoading}>
        <AlertDialogContent>
          <div className="flex flex-col items-center justify-center">
            <Spinner className="size-8" />
            {progress < 1 ? (
              <p className="text-center">Gerando relatório...</p>
            ) : (
              <p className="text-center">Preparando documento...</p>
            )}
            <Progress value={progress * 100} className="w-full" />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
