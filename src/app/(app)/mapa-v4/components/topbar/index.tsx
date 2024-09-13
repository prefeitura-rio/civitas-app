'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowUpRight,
  CarFront,
  Cctv,
  Hash,
  MapPin,
  Plus,
  Search,
  Trash,
} from 'lucide-react'
import { useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { DatePickerWithRange } from '@/components/custom/date-range-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { useRouter } from 'next/navigation'
import { toQueryParams } from '@/utils/to-query-params'

const filterFormSchema = z.object({
  plate: z
    .string()
    .toUpperCase()
    .refine(
      (val) => {
        // If the value contains a wildcard character, it's valid
        if (val.includes('*')) {
          return true
        }
        // Otherwise, it must match the regex pattern
        return /^[A-Z]{3}\d[A-Z\d]\d{2}$/.test(val)
      },
      { message: 'Formato inválido' },
    )
    .optional(),
  brandAndModel: z.string().optional(),
  color: z.string().optional(),
  date: z
    .object(
      {
        from: z.date({ message: 'Campo obrigatório' }),
        to: z.date({ message: 'Selecione uma data de término' }),
      },
      { message: 'Campo obrigatório' },
    )
    .superRefine((val, ctx) => {
      if (val.to > new Date()) {
        ctx.addIssue({
          code: 'invalid_date',
          message: 'A data de término deve ser menor ou igual à data atual',
        })
      }
    }),
})

type FilterForm = z.infer<typeof filterFormSchema>

export function Topbar() {
  const router = useRouter()
  const radarSearchInputRef = useRef<HTMLInputElement | null>(null)
  const {
    layers: {
      radars: { selectedObjects, handleSelectObject, data: radars },
    },
    setViewport,
  } = useMap()

  const today = new Date()
  const from = new Date()
  from.setDate(today.getDate() - 7)
  from.setMinTime()

  const { control, watch, register, handleSubmit, formState: {errors} } = useForm<FilterForm>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      date: {
        from,
        to: today,
      },
    },
  })

  const usedFields = () => {
    let count = 0
    if (watch('color')) count++
    if (watch('brandAndModel')) count++
    if (watch('plate')) count++
    return count
  }

  function onSubmit(data: FilterForm) {
    // ...
    const queryData = { ...data, radarIds: selectedObjects.map((item) => item.cameraNumber) }
    const query = toQueryParams(queryData)
    console.log(query.toString())
    router.push(`/mapa-v4/busca/radares?${query.toString()}`)
  }

  return (
    <div className="z-40 flex items-center justify-center border-2 py-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="custom-shadow flex items-center justify-evenly gap-4 rounded-full border-2 bg-background px-8 py-4 shadow-muted-foreground transition-all duration-500"
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex shrink-0 items-center justify-start gap-2"
            >
              <CarFront className="size-4 shrink-0" />
              <span>
                Propriedades do Veículo{' '}
                {usedFields() > 0 ? `(${usedFields()})` : ''}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-2">
            <div>
              <Label htmlFor="plate">Placa</Label>
              <Input id="plate" placeholder="Placa" {...register('plate')} />
            </div>
            <div>
              <Label htmlFor="brandAndModel">Marca/Modelo</Label>
              <Input
                id="brandAndModel"
                placeholder="Marca/Modelo"
                {...register('brandAndModel')}
              />
            </div>
            <div>
              <Label htmlFor="color">Cor</Label>
              <Input id="color" placeholder="Cor" {...register('color')} />
            </div>
          </PopoverContent>
        </Popover>
        <Controller
          control={control}
          name="date"
          render={({ field }) => {
            return (
              <DatePickerWithRange
                className="w-full"
                placeholder="Selecione uma data"
                onChange={field.onChange}
                fromDate={new Date(2024, 5, 1)}
                toDate={new Date()}
                value={field.value}
                defaultValue={field.value}
                defaultMonth={new Date().getMonth() - 1}
              />
            )
          }}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Cctv className="size-4 shrink-0" />
              <span>
                Radares{' '}
                {selectedObjects.length > 0
                  ? `(${selectedObjects.length})`
                  : ''}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-2">
            <div>
              <div className="relative">
                <Input
                  ref={radarSearchInputRef}
                  className="mb-4 pr-10"
                  placeholder="Adicione um radar"
                />
                <Button
                  className="absolute-y-centered right-0 size-9 shrink-0"
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
                  <Plus className="size-4 shrink-0" />
                </Button>
              </div>
              {selectedObjects.length > 0 && (
                <Label>Radares selecionados</Label>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {selectedObjects.map((radar, index) => (
                <div
                  key={index}
                  className="relative flex flex-col gap-2 rounded-md border border-secondary px-2 py-4 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Hash className="size-4 shrink-0" />
                    <span>{radar.cameraNumber}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0" />
                    <span>{radar.location}</span>
                  </div>

                  <Button
                    variant="secondary"
                    className="absolute right-8 top-1 size-6 shrink-0 p-0"
                    onClick={() => {
                      setViewport({
                        longitude: radar.longitude,
                        latitude: radar.latitude,
                        zoom: 20,
                      })
                    }}
                  >
                    <ArrowUpRight className="size-4 shrink-0" />
                  </Button>

                  <Button
                    variant="secondary"
                    className="absolute right-1 top-1 size-6 shrink-0 p-0"
                    onClick={() => {
                      handleSelectObject(radar)
                    }}
                  >
                    <Trash className="size-4 shrink-0" />
                  </Button>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="secondary"
          className="flex items-center gap-2"
          type='submit'
        >
          <Search className="size-5 shrink-0" />
          <span>Pesquisar</span>
        </Button>
      </form>
    </div>
  )
}
