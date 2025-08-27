'use client'
import '@/utils/date-extensions'

import { zodResolver } from '@hookform/resolvers/zod'
import { addMinutes, format } from 'date-fns'
import {
  Info,
  MapPinIcon,
  NavigationIcon,
  RectangleEllipsis,
  SearchIcon,
  XCircleIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Slider } from '@/components/custom/double-slider'
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
import { optionalPlateHintSchema } from '@/utils/zod-schemas'

export const radarSearchSchema = z.object({
  date: z.date({ message: 'Campo obrigatório' }),
  duration: z.array(z.coerce.number()),
  plate: optionalPlateHintSchema,
  radarIds: z
    .array(z.string(), { message: 'Campo obrigatório 2' })
    .min(1, { message: 'Campo obrigatório' }),
})

export type RadarSearchFormData = z.infer<typeof radarSearchSchema>

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
          date: formattedSearchParams.date
            ? new Date(formattedSearchParams.date)
            : undefined,
          duration: formattedSearchParams.duration,
          plate: formattedSearchParams.plate,
          radarIds: formattedSearchParams.radarIds,
        }
      : {
          date: new Date(new Date().setSeconds(0, 0)),
          duration: [-60, 60],
          radarIds: [],
          plate: '',
        },
  })

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
              name="date"
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
            <InputError message={errors.date?.message} />
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

          <Controller
            control={control}
            name="duration"
            render={({ field }) => {
              const selectedDate = watch('date') || new Date()
              return (
                <div className="w-full space-y-2 pt-6">
                  <Slider
                    unity="min"
                    value={field.value}
                    onValueChange={(value) => {
                      if (value[0] > 0) field.onChange([0, value[1]])
                      else if (value[1] < 0) field.onChange([value[0], 0])
                      else field.onChange(value)
                    }}
                    defaultValue={[0, 0]}
                    max={150}
                    min={-150}
                    step={1}
                    disabled={isSubmitting}
                    labelFormatter={(val) =>
                      `${format(addMinutes(selectedDate, val), 'HH:mm')}h`
                    }
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Min: {format(addMinutes(selectedDate, -150), 'HH:mm')}h
                    </span>
                    <span>
                      Max: {format(addMinutes(selectedDate, 150), 'HH:mm')}h
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>
                      {(() => {
                        const min = field.value?.[0] ?? 0
                        const abs = Math.abs(min)
                        const sign = min > 0 ? '+' : min < 0 ? '-' : ''
                        if (abs >= 60) {
                          const h = Math.floor(abs / 60)
                          const m = abs % 60
                          return `(${sign}${h}h${m > 0 ? ` ${m}min` : ''})`
                        }
                        return `(${sign}${abs}min)`
                      })()}
                    </span>
                    <span>
                      {(() => {
                        const max = field.value?.[1] ?? 0
                        const abs = Math.abs(max)
                        const sign = max > 0 ? '+' : max < 0 ? '-' : ''
                        if (abs >= 60) {
                          const h = Math.floor(abs / 60)
                          const m = abs % 60
                          return `(${sign}${h}h${m > 0 ? ` ${m}min` : ''})`
                        }
                        return `(${sign}${abs}min)`
                      })()}
                    </span>
                  </div>
                </div>
              )
            }}
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
