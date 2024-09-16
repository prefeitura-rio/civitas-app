'use client'
import '@/utils/date-extensions'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  MapPinIcon,
  NavigationIcon,
  RectangleEllipsis,
  SearchIcon,
  XCircleIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { InputError } from '@/components/custom/input-error'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { useCarRadarSearchParams } from '@/hooks/use-params/use-car-radar-search-params.'
import { toQueryParams } from '@/utils/to-query-params'

import { RadarSearchFormData, radarSearchSchema } from './validationSchemas'

export function RadarSearch() {
  const radarSearchInputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()

  const { formattedSearchParams } = useCarRadarSearchParams()

  const {
    layers: {
      radars: { selectedObjects, handleSelectObject, data: radars },
    },
    setViewport,
  } = useMap()

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RadarSearchFormData>({
    resolver: zodResolver(radarSearchSchema),
    defaultValues: {
      date: formattedSearchParams.date
        ? new Date(formattedSearchParams.date)
        : new Date().addHours(-1),
      duration: formattedSearchParams.duration || [-30, 30],
      plateHint: formattedSearchParams.plateHint || '',
      radarIds:
        formattedSearchParams.radarIds ||
        selectedObjects.map((radar) => radar.cameraNumber),
    },
  })

  const onSubmit = (data: RadarSearchFormData) => {
    const query = toQueryParams(data)
    console.log(query.toString())
    router.push(`/mapa-v4/busca/radares?${query.toString()}`)
  }

  useEffect(() => {
    setValue(
      'radarIds',
      selectedObjects.map((radar) => radar.cameraNumber),
    )
  }, [selectedObjects])

  useEffect(() => {
    if (radars) {
      if (formattedSearchParams.radarIds) {
        formattedSearchParams.radarIds.forEach((radarId) => {
          const radar = radars?.find(
            (radar) =>
              radar.cameraNumber === radarId || radar.cetRioCode === radarId,
          )
          if (radar) {
            handleSelectObject(radar)
          }
        })
      }
    }
  }, [radars])

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex translate-y-2 items-center gap-4"
    >
      <div className="flex flex-col">
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DatePicker
              className="w-48"
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

      <Controller
        control={control}
        name="duration"
        render={({ field }) => (
          <div className="w-64 space-y-2 px-7 pt-6">
            <Slider
              value={field.value}
              onValueChange={(value) => {
                if (value[0] > 0) field.onChange([0, value[1]])
                else if (value[1] < 0) field.onChange([value[0], 0])
                else field.onChange(value)
              }}
              defaultValue={[5, 10]}
              max={60}
              min={-60}
              step={5}
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: -60min</span>
              <span>Max: 60min</span>
            </div>
          </div>
        )}
      />

      <div className="flex flex-col">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-36">
              <MapPinIcon className="mr-2 size-4 shrink-0" />
              Radares ({selectedObjects.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent sideOffset={2} className="w-80 dark:bg-gray-700">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  ref={radarSearchInputRef}
                  placeholder="Código do Radar"
                  className="dark:bg-gray-600 dark:text-white"
                />
                <Button
                  className="dark:bg-blue-600"
                  onClick={() => {
                    console.log(radarSearchInputRef.current?.value)
                    const radar = radars?.find(
                      (item) =>
                        item.cameraNumber ===
                          radarSearchInputRef.current?.value ||
                        item.cetRioCode === radarSearchInputRef.current?.value,
                    )
                    if (radar) {
                      handleSelectObject(radar)
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
                    key={radar.cameraNumber}
                    className="flex items-center justify-between rounded bg-secondary p-2"
                  >
                    <div>
                      <div className="font-medium">{radar.cameraNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {radar.location}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="dark:text-white"
                      >
                        <NavigationIcon className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="dark:text-white"
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

      <div className="flex flex-col">
        <div className="relative">
          <RectangleEllipsis className="absolute left-3 top-1/2 size-4 -translate-y-1/2 transform text-gray-400" />
          <Controller
            name="plateHint"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                placeholder="Placa do Veículo"
                className="w-44 pl-10 dark:bg-gray-700 dark:text-white"
              />
            )}
          />
        </div>
        <InputError message={errors.plateHint?.message} />
      </div>

      <Button type="submit" className="mb-4 dark:bg-blue-600">
        <SearchIcon className="mr-2 size-4" />
        Buscar
      </Button>
    </form>
  )
}
