'use client'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

import { SelectWithSearch } from '@/components/custom/select-with-search'
import { Spinner } from '@/components/custom/spinner'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { useCarRadarSearchParams } from '@/hooks/use-params/use-car-radar-search-params.'
import { useRadars } from '@/hooks/use-queries/use-radars'
// import { getBulkPlatesInfo } from '@/http/cars/plate/get-plate-info-bulk'
import { getCarsByRadar } from '@/http/cars/radar/get-cars-by-radar'
import type { Radar, RadarDetection, Vehicle } from '@/models/entities'

import {
  type DetectionGroup,
  DetectionsTable,
} from './components/detections-table'
import { DownloadReport } from './components/download-report'
import { InvalidParamsAlert } from './components/invalid-params-alert'

export default function RadarDetections() {
  const { formattedSearchParams, queryKey } = useCarRadarSearchParams()
  const [plateFilter, setPlateFilter] = useState('')
  const [brandModelFilter, setBrandModelFilter] = useState('')
  const [brandModels, setBrandModels] = useState<string[]>([])
  const [filteredData, setFilteredData] = useState<
    DetectionGroup[] | undefined
  >(undefined)

  const { data: radars } = useRadars()
  console.log(plateFilter)

  if (!formattedSearchParams) {
    return <InvalidParamsAlert />
  }

  const radarIds = formattedSearchParams.radarIds
  const startTime = new Date(formattedSearchParams.date)
    .addMinutes(formattedSearchParams.duration[0])
    .toISOString()
  const endTime = new Date(formattedSearchParams.date)
    .addMinutes(formattedSearchParams.duration[1])
    .toISOString()
  const plateHint = formattedSearchParams.plate

  const { data, isPending } = useQuery({
    queryKey,
    queryFn: async () => {
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

      return Object.values(groupedData) as DetectionGroup[]
    },
    enabled: !!radars && !!formattedSearchParams,
  })

  function filterByPlate(data: DetectionGroup[], plate: string) {
    // Transforma caracteres minúsculos em maiúsculos
    const upperCasePlate = plate.toUpperCase()
    setPlateFilter(upperCasePlate)

    const filtered = data?.map((group) => {
      if (!plate) return group

      if (!plate.includes('*')) {
        const detections = group.detections.filter((detection) =>
          detection.plate.includes(upperCasePlate),
        )
        return {
          ...group,
          detections,
        }
      }

      const regexString = `\\b${plate.replace(/\*/g, '.*')}\\b`
      const regex = new RegExp(regexString, 'i')

      const detections = group.detections.filter((detection) =>
        regex.test(detection.plate),
      )

      return {
        ...group,
        detections,
      }
    })

    return filtered
  }

  function filterByBrandModel(data: DetectionGroup[], brandModel: string) {
    setBrandModelFilter(brandModel)

    const filtered = data?.map((group) => {
      if (!brandModel) return group

      const detections = group.detections.filter(
        (detection) => detection.brandModel === brandModel,
      )

      return {
        ...group,
        detections,
      }
    })

    return filtered
  }

  useEffect(() => {
    const filteredByBrandModelResult = filterByBrandModel(
      data || [],
      brandModelFilter,
    )
    const filteredByPlateResult = filterByPlate(
      filteredByBrandModelResult,
      plateFilter,
    )
    setFilteredData(filteredByPlateResult)
  }, [plateFilter, brandModelFilter])

  useEffect(() => {
    setFilteredData(data)
    const detections = data?.map((group) => group.detections).flat()
    console.log(detections)
    const brandModelsWithDuplicates = detections?.map(
      (detection) => detection.brandModel,
    )
    console.log(brandModelsWithDuplicates)
    const uniqueBrandModels = [...new Set(brandModelsWithDuplicates)]
    console.log(uniqueBrandModels)
    setBrandModels(uniqueBrandModels)
  }, [data])

  return (
    <div className="relative flex h-full flex-col gap-4 overflow-y-scroll p-2">
      {data && (
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
      )}
      {formattedSearchParams && (
        <div className="text-center">
          <h4 className="">Resultado para</h4>
          <span className="block text-sm text-muted-foreground">
            {radarIds.join(', ')}
          </span>
          <span className="text-sm text-muted-foreground">
            {`${format(startTime, 'dd MMM, y HH:mm', { locale: ptBR })} - ${format(endTime, 'dd MMM, y HH:mm', { locale: ptBR })}`}
          </span>
        </div>
      )}
      {isPending && (
        <div className="flex w-full justify-center p-6">
          <Spinner className="size-10" />
        </div>
      )}
      {filteredData && (
        <div>
          <div className="mb-4 flex gap-2">
            <Input
              value={plateFilter}
              onChange={(e) => setPlateFilter(e.target.value)}
              className="w-44"
              placeholder="Filtrar por placa"
            />
            <div className="w-72">
              <SelectWithSearch
                onSelect={(item) => {
                  setBrandModelFilter(item.value)
                }}
                options={brandModels.map((item) => {
                  return {
                    label: item,
                    value: item,
                  }
                })}
                value={brandModelFilter}
                placeholder="Selecione uma marca/modelo"
              />
            </div>
          </div>
          {filteredData.map((item, index) => (
            <div key={item.location} className="relative mb-10 space-y-4">
              <Collapsible>
                <CollapsibleTrigger
                  id={item.location}
                  className="AccordionTrigger"
                  asChild
                >
                  <Button
                    variant="ghost"
                    className="flex h-auto w-full flex-col items-start"
                  >
                    <div className="flex w-full items-center justify-between">
                      <h4 className="text-start">Grupo {index + 1}</h4>
                      <ChevronDown className="AccordionChevron size-6 shrink-0" />
                    </div>
                    <span className="block text-start text-gray-400">
                      {item.location}
                    </span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent
                  className="CollapsibleContent"
                  id={item.location}
                >
                  <DetectionsTable data={item} isLoading={isPending} />
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
