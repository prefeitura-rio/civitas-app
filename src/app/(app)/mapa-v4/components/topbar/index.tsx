import { zodResolver } from '@hookform/resolvers/zod'
import { CarFront, Cctv, Search } from 'lucide-react'
import { useEffect } from 'react'
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
  radars: z.array(z.string()),
})

type FilterForm = z.infer<typeof filterFormSchema>

export function Topbar() {
  const today = new Date()
  const from = new Date()
  from.setDate(today.getDate() - 7)
  from.setMinTime()

  const { control, watch, register, setValue } = useForm<FilterForm>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      date: {
        from,
        to: today,
      },
      radars: [],
    },
  })

  const usedFields = () => {
    let count = 0
    if (watch('color')) count++
    if (watch('brandAndModel')) count++
    if (watch('plate')) count++
    return count
  }

  const {
    layers: {
      radars: { selectedObjects },
    },
  } = useMap()

  useEffect(() => {
    setValue(
      'radars',
      selectedObjects.map((radar) => radar.cameraNumber),
    )
  }, [selectedObjects])

  return (
    <div className="z-40 flex items-center justify-center border-2 py-4">
      <div className="custom-shadow flex items-center justify-evenly gap-4 rounded-full border-2 bg-background px-8 py-4 shadow-muted-foreground transition-all duration-500">
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
        <Popover modal>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Cctv className="size-4 shrink-0" />
              <span>
                Radares{' '}
                {watch('radars').length > 0
                  ? `(${watch('radars').length})`
                  : ''}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-2">
            <Controller
              control={control}
              name="radars"
              render={({ field }) => (
                <div>
                  <Input placeholder="Encontre um radar" />
                  <Label className="mt-2">Radares selecionados:</Label>
                  <div className="mt-1 flex flex-col gap-1">
                    {selectedObjects.map((radar) => (
                      <span>{radar.cameraNumber}</span>
                    ))}
                  </div>
                </div>
              )}
            />
          </PopoverContent>
        </Popover>

        <Button variant="secondary" className="flex items-center gap-2">
          <Search className="size-5 shrink-0" />
          <span>Pesquisar</span>
        </Button>
      </div>
    </div>
  )
}
