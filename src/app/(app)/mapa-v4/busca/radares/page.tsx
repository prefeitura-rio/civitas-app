'use client'
import { Label } from "@/components/ui/label"
import { useMap } from "@/hooks/use-contexts/use-map-context"
import { useCarRadarSearchParams } from "@/hooks/use-params/use-car-radar-search-params."
import { useRadars } from "@/hooks/use-queries/use-radars"
import { getCarsByRadar } from "@/http/cars/radar/get-cars-by-radar"
import { cn } from "@/lib/utils"
import type { Radar, RadarDetection } from "@/models/entities"
import { useQuery } from "@tanstack/react-query"
import { formatDate } from "date-fns"
import { useSearchParams } from "next/navigation"
import { Fragment } from "react"

const radarLabels: Record<Exclude<keyof Radar, 'hasData' | 'activeInLast24Hours'>, string> = {
  cameraNumber: 'Câmera Número',
  cetRioCode: 'Código CET-Rio',
  location: 'Localização',
  district: 'Bairro',
  streetName: 'Logradouro',
  direction: 'Direção',
  company: 'Empresa',
  longitude: 'Longitude',
  latitude: 'Latitude',
  lastDetectionTime: 'Última detecção',
}

const detectionLabels: Record<keyof RadarDetection, string> = {
  plate: 'Placa',
  speed: 'Velocidade',
  timestamp: 'Data e Hora',
}

export default function RadarDetections() {
  const { formattedSearchParams, queryKey } = useCarRadarSearchParams()
  const { data: radars } = useRadars()

  const { data } = useQuery({
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

        const radar = radars?.find((item) => item.cameraNumber === cameraNumber)

        return {
          radar,
          detections,
        }
      })

      return Promise.all(result)
    },
    enabled: !!radars,
  })


  return (
    <div className="overflow-y-scroll h-full p-2">
      {data?.map((item) => (
        <div key={item.radar?.cameraNumber}>
          <h3>Radar {item.radar?.cameraNumber}</h3>

          <h4>Propriedades do Radar</h4>
          <div className="ml-4">
            {Object.entries(radarLabels).map(([key, label], index) => (
              <div key={index}>
                <Label>{label}: </Label>
                <span className='textt-xs text-muted-foreground'>{item.radar?.[key as keyof Radar]}</span>
              </div>
            ))}
          </div>

          <h4>Detecções</h4>
          <div className={cn('grid w-96', `grid-cols-${Object.keys(detectionLabels).length + 1}`)}>
            {Object.entries(detectionLabels).map(([key, label], index) => {
              if (key === 'timestamp') {
                return  <Label key={index} className="col-span-2">{label}</Label>                
              } else {
                return  <Label key={index}>{label}</Label>                
              }
            })}

            {item.detections.map((detection) => (
              Object.keys(detectionLabels).map((key, j) => {
                const value = detection[key as keyof RadarDetection]
                if (key === 'timestamp' ) {
                  return <span key={j} className='text-sm text-muted-foreground col-span-2'>{formatDate(value, 'dd/MM/y HH:mm:ss')}</span>

                } else {

                  return <span key={j} className='text-sm text-muted-foreground'>{value}</span>
                }
              })
            ))}
          </div>
        </div>
      ))}

    </div>
  )
}