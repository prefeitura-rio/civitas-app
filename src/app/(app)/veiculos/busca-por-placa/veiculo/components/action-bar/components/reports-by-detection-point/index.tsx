import { pdf } from '@react-pdf/renderer'
import { Printer } from 'lucide-react'
import React, { useCallback, useRef, useState } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { useCarPathsSearchParams } from '@/hooks/use-params/use-car-paths-search-params'
import { useRadars } from '@/hooks/use-queries/use-radars'
import type { DetectionDTO } from '@/hooks/use-queries/use-radars-search'
import { getCarsByRadar } from '@/http/cars/radar/get-cars-by-radar'

import { type ReportData, ReportDocument } from './components/report/document'

export default function DownloadReportsByDetectionPointButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const countRef = useRef(0)

  const {
    layers: {
      trips: { trips, isLoading: isTripsLoading },
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
      const pointUniqueLocation = `${point.location?.replace(/ - FX .*/, '')} ${point.direction} ${point.district}`

      const group = radars.filter((radar) => {
        const radarUniqueLocation = `${radar.location?.replace(/ - SENTIDO .*/, '')} ${radar.direction} ${radar.district}`
        return radarUniqueLocation === pointUniqueLocation
      })

      return {
        point,
        radars: group,
      }
    })

    const detectionsByGroup: ReportData = []
    const total = pointsAndRadarGroups.reduce(
      (acc, group) => acc + group.radars.length,
      1,
    )

    for await (const pointAndRadarGroup of pointsAndRadarGroups) {
      const { point, radars } = pointAndRadarGroup

      // Params da busca por groupo de radar = 5 minutos antes e depois da detecção naquele ponto
      const startTime = new Date(point.startTime).addMinutes(-5).toISOString()
      const endTime = new Date(point.startTime).addMinutes(5).toISOString()

      // Detecções combinadas de todos os radares do grupo
      const detections = await Promise.all(
        // Para cada radar do grupo
        radars.map(async (radar) => {
          // Detecções do radar
          const detections = await getCarsByRadar({
            radar: radar.cameraNumber,
            startTime,
            endTime,
          })

          // Adiciona informações do radar à detecção
          const joinedData = detections.map((detection) => {
            return {
              ...detection, // plate, timestamp, speed
              cameraNumber: radar.cameraNumber,
              lane: radar.lane || '',
              location: radar.location?.replace(/- FX \d+/, '') || '',
            } as DetectionDTO
          })

          countRef.current = countRef.current + 1
          setProgress(countRef.current / total)

          return joinedData
        }),
      )

      // Detecções ordenadas por timestamp
      const sortedDetections = detections
        .flat()
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )

      // Adiciona detecções ao grupo
      detectionsByGroup.push({
        detections: sortedDetections,
        from: startTime,
        to: endTime,
        monitoredPlateTimestamp: point.startTime,
        groupLocation: `${point.location?.replace(/ - FX .*/, '') || ''}, ${point.district} - ${point.direction}`,
        latitude: radars.at(0)?.latitude || 0,
        longitude: radars.at(0)?.longitude || 0,
        totalDetections: sortedDetections.length,
        radarIds: radars.map((radar) => radar.cameraNumber),
      })
    }

    return detectionsByGroup
    // Retorna uma lista de grupos de detecções
  }, [trips, radars])

  async function handleDownload() {
    if (!formattedSearchParams)
      throw new Error('formattedSearchParams is required')
    if (!trips) throw new Error('trips is required')
    if (!radars) throw new Error('radars is required')

    setIsLoading(true)
    const data = await getReportData()

    const blob = await pdf(
      <ReportDocument
        params={{
          plate: formattedSearchParams.plate,
          startTime: formattedSearchParams.from,
          endTime: formattedSearchParams.to,
        }}
        data={data}
      />,
    ).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'busca_por_radar.pdf'
    a.click()
    URL.revokeObjectURL(url)
    setIsLoading(false)
  }

  return (
    <Tooltip
      asChild
      text="Relatório de placas conjuntas"
      disabledText={
        isLoading
          ? `Relatório de placas conjuntas (${(progress * 100).toFixed(0)}%)`
          : undefined
      }
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
    </Tooltip>
  )
}
