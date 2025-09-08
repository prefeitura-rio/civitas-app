'use client'
import '@/utils/date-extensions'

import { zodResolver } from '@hookform/resolvers/zod'
import { MapPinIcon, NavigationIcon, XCircleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  type RadarSearchFormData,
  radarSearchSchema,
} from '@/app/(app)/veiculos/components/validationSchemas'
import { InputError } from '@/components/custom/input-error'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useMap } from '@/hooks/useContexts/use-map-context'
import { useCarRadarSearchParams } from '@/hooks/useParams/useCarRadarSearchParams'
import { toQueryParams } from '@/utils/to-query-params'

import { DateField } from './date-field'
import { InputField } from './input-field'

interface TimeValidation {
  isValid: boolean
  message: string
  duration: number
}

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000
const MIN_DATE = new Date(2024, 5, 1)
const MAX_DATE = new Date()

export function SearchByRadarForm() {
  const radarSearchInputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()
  const { formattedSearchParams } = useCarRadarSearchParams()
  const {
    layers: {
      radars: {
        selectedObjects,
        handleSelectObject,
        setSelectedObjects,
        data: radars,
      },
    },
    setViewport,
  } = useMap()

  const [timeValidation, setTimeValidation] = useState<TimeValidation>({
    isValid: true,
    message: '',
    duration: 0,
  })

  const defaultValues = useMemo(
    () => ({
      startDate: formattedSearchParams?.date.from
        ? new Date(formattedSearchParams.date.from)
        : new Date(new Date().setSeconds(0, 0)),
      endDate: formattedSearchParams?.date.to
        ? new Date(formattedSearchParams.date.to)
        : new Date(new Date().setSeconds(0, 0) + FIVE_HOURS_MS),
      plate: formattedSearchParams?.plate || '',
      radarIds: formattedSearchParams?.radarIds || [],
    }),
    [formattedSearchParams],
  )

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<RadarSearchFormData>({
    resolver: zodResolver(radarSearchSchema),
    defaultValues,
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')

  // Sincronizar radares selecionados no mapa com o formulário
  useEffect(() => {
    setValue(
      'radarIds',
      selectedObjects.map((radar) => radar.cetRioCode),
    )
  }, [selectedObjects, setValue])

  // Sincronizar radares do formulário com o contexto do mapa (ao carregar da URL)
  useEffect(() => {
    if (radars && formattedSearchParams && selectedObjects.length === 0) {
      const ids = formattedSearchParams.radarIds

      const selectedRadars = radars.filter((radar) =>
        ids.includes(radar.cetRioCode),
      )

      setSelectedObjects(selectedRadars)
    }
  }, [
    radars,
    formattedSearchParams,
    selectedObjects.length,
    setSelectedObjects,
  ])

  // Ajustar automaticamente endDate quando startDate mudar
  useEffect(() => {
    if (startDate) {
      const newEndDate = new Date(startDate.getTime() + FIVE_HOURS_MS)
      setValue('endDate', newEndDate)
    }
  }, [startDate, setValue])

  // Validar tempo em tempo real
  useEffect(() => {
    if (!startDate || !endDate) return

    const timeDiff = endDate.getTime() - startDate.getTime()
    const isValid = timeDiff > 0 && timeDiff <= FIVE_HOURS_MS

    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

    const message = isValid
      ? `${hours}h ${minutes}min`
      : timeDiff <= 0
        ? 'A data/hora de fim deve ser posterior à data/hora de início'
        : `Máximo de 5 horas permitido (atual: ${hours}h ${minutes}min)`

    setTimeValidation({ isValid, message, duration: timeDiff })
  }, [startDate, endDate])

  const handleFormSubmit = useCallback(
    (data: RadarSearchFormData) => {
      const queryData = {
        startDate: data.startDate,
        endDate: data.endDate,
        plate: data.plate,
        radarIds: data.radarIds,
      }

      const query = toQueryParams(queryData)
      const url = `/veiculos/busca-por-radar/resultado?${query.toString()}`
      router.push(url)
    },
    [router],
  )

  return (
    <>
      <Card className="mb-0 w-full max-w-screen-md p-4">
        <h1 className="text-lg font-bold">Busca por Radar</h1>
      </Card>

      <Card className="flex w-full max-w-screen-md flex-col p-6">
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="grid grid-cols-2 gap-x-8 gap-y-2"
        >
          <DateField
            name="startDate"
            label="Data/Hora de Início"
            control={control}
            isSubmitting={isSubmitting}
            errors={errors}
            minDate={MIN_DATE}
            maxDate={MAX_DATE}
          />

          <DateField
            name="endDate"
            label="Data/Hora de Fim"
            showValidation={true}
            control={control}
            isSubmitting={isSubmitting}
            errors={errors}
            timeValidation={timeValidation}
            minDate={MIN_DATE}
            maxDate={MAX_DATE}
          />

          <InputField
            name="plate"
            label="Placa"
            placeholder="Digite a placa do veículo"
            control={control}
            isSubmitting={isSubmitting}
            errors={errors}
          />

          <div className="flex w-full flex-col">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                  <MapPinIcon className="mr-2 size-4 shrink-0" />
                  Radares ({selectedObjects.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent
                sideOffset={2}
                className="max-h-96 w-80 overflow-y-auto"
              >
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      ref={radarSearchInputRef}
                      placeholder="Código CET-RIO"
                    />
                    <Button
                      onClick={() => {
                        const radar = radars?.find(
                          (item) =>
                            item.cetRioCode ===
                            radarSearchInputRef.current?.value,
                        )
                        if (radar) {
                          if (
                            !selectedObjects.find(
                              (item) => item.cetRioCode === radar.cetRioCode,
                            )
                          ) {
                            setSelectedObjects((prev) => [radar, ...prev])
                          }
                          radarSearchInputRef.current!.value = ''
                          setViewport({
                            longitude: radar.longitude,
                            latitude: radar.latitude,
                            zoom: 20,
                          })
                        }
                      }}
                    >
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {selectedObjects.map((radar) => (
                      <div
                        key={radar.cetRioCode}
                        className="flex items-center justify-between rounded bg-secondary p-2"
                      >
                        <div>
                          <div className="font-medium">{radar.cetRioCode}</div>
                          <div className="text-sm text-muted-foreground">
                            {radar.location}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setViewport({
                                longitude: radar.longitude,
                                latitude: radar.latitude,
                                zoom: 20,
                              })
                            }}
                          >
                            <NavigationIcon className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectObject(radar)}
                          >
                            <XCircleIcon className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <InputError message={errors.radarIds?.message} />
          </div>

          <div className="col-span-2 mt-4 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </form>
      </Card>
    </>
  )
}
