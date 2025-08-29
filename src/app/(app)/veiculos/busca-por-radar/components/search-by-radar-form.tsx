'use client'
import '@/utils/date-extensions'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Info,
  MapPinIcon,
  NavigationIcon,
  RectangleEllipsis,
  SearchIcon,
  XCircleIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { InputError } from '@/components/custom/input-error'
import { PlateWildcardsHelperInfo } from '@/components/custom/plate-wildcards-helper-info'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { useCarRadarSearchParams } from '@/hooks/use-params/use-car-radar-search-params.'
import { toQueryParams } from '@/utils/to-query-params'

import {
  RadarSearchFormData,
  radarSearchSchema,
} from '../../components/validationSchemas'

export function SearchByRadarForm() {
  const radarSearchInputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()
  const [timeValidation, setTimeValidation] = useState<{
    isValid: boolean
    message: string
  } | null>(null)

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

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RadarSearchFormData>({
    resolver: zodResolver(radarSearchSchema),
    defaultValues: formattedSearchParams
      ? {
          startDate: formattedSearchParams.date.from
            ? new Date(formattedSearchParams.date.from)
            : new Date(new Date().setSeconds(0, 0)),
          endDate: formattedSearchParams.date.to
            ? new Date(formattedSearchParams.date.to)
            : new Date(new Date().setSeconds(0, 0) + 60 * 60 * 1000), // +1 hora
          plate: formattedSearchParams.plate,
          radarIds: formattedSearchParams.radarIds,
        }
      : {
          startDate: new Date(new Date().setSeconds(0, 0)),
          endDate: new Date(new Date().setSeconds(0, 0) + 60 * 60 * 1000), // +1 hora
          radarIds: [],
          plate: '',
        },
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')

  useEffect(() => {
    if (startDate && endDate) {
      const timeDiff = endDate.getTime() - startDate.getTime()
      const maxTimeDiff = 5 * 60 * 60 * 1000 // 5 horas em milissegundos

      if (endDate <= startDate) {
        setTimeValidation({
          isValid: false,
          message: 'Data de fim deve ser posterior à data de início',
        })
      } else if (timeDiff > maxTimeDiff) {
        setTimeValidation({
          isValid: false,
          message: 'Intervalo máximo de 5 horas excedido',
        })
      } else {
        setTimeValidation({
          isValid: true,
          message: 'Intervalo válido',
        })
      }
    }
  }, [startDate, endDate])

  const onSubmit = (data: RadarSearchFormData) => {
    const query = toQueryParams(data)
    router.push(`/veiculos/busca-por-radar/resultado?${query.toString()}`)
  }

  useEffect(() => {
    setValue(
      'radarIds',
      selectedObjects.map((radar) => radar.cetRioCode),
    )
  }, [selectedObjects])

  useEffect(() => {
    if (radars && formattedSearchParams && selectedObjects.length === 0) {
      const ids = formattedSearchParams.radarIds

      const selectedRadars = radars.filter((radar) =>
        ids.includes(radar.cetRioCode),
      )

      setSelectedObjects(selectedRadars)
    }
  }, [radars])

  return (
    <>
      <Card className="mb-0 w-full max-w-screen-md p-4">
        <h1 className="text-lg font-bold">Busca por Radar</h1>
      </Card>

      <Card className="flex w-full max-w-screen-md flex-col p-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-x-8 gap-y-2"
        >
          <div className="flex w-full flex-col">
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <DatePicker
                  className="w-full"
                  value={field.value}
                  onChange={field.onChange}
                  type="datetime-local"
                  disabled={isSubmitting}
                  fromDate={new Date(2024, 5, 1)}
                  toDate={new Date()}
                />
              )}
            />
            <InputError message={errors.startDate?.message} />
          </div>

          <div className="flex w-full flex-col">
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <DatePicker
                  className="w-full"
                  value={field.value}
                  onChange={field.onChange}
                  type="datetime-local"
                  disabled={isSubmitting}
                  fromDate={new Date(2024, 5, 1)}
                  toDate={new Date()}
                />
              )}
            />
            <InputError message={errors.endDate?.message} />
            {timeValidation && (
              <div
                className={`text-xs ${timeValidation.isValid ? 'text-green-600' : 'text-red-500'}`}
              >
                {timeValidation.message}
              </div>
            )}
          </div>

          <div className="flex w-full flex-col">
            <div className="relative w-full">
              <RectangleEllipsis className="absolute left-3 top-1/2 size-4 -translate-y-1/2 transform text-gray-400" />
              <Controller
                name="plate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                    placeholder="Placa do Veículo (opcional)"
                    className="w-full pl-10 pr-8 dark:bg-gray-700 dark:text-white"
                  />
                )}
              />
              <div className="absolute-y-centered right-2 flex items-center">
                <Tooltip render={<PlateWildcardsHelperInfo />}>
                  <Info className="size-4 text-muted-foreground" />
                </Tooltip>
              </div>
            </div>
            <InputError message={errors.plate?.message} />
          </div>

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

          <div className="col-span-2 flex justify-end">
            <Button type="submit" className="mt-4">
              <SearchIcon className="mr-2 size-4" />
              Buscar
            </Button>
          </div>
        </form>
      </Card>
    </>
  )
}
