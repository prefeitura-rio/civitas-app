'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { FilterX, Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const filterFormSchema = z.object({
  plate: z.string().toUpperCase().optional(),
  startTimeCreate: z.string().optional(),
  endTimeCreate: z.string().optional(),
  startTimeDelete: z.string().optional(),
  endTimeDelete: z.string().optional(),
})

type FilterForm = z.infer<typeof filterFormSchema>

export function HistoryFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()

  const [startDeleteDate, setStartDeleteDate] = useState<Date | undefined>()
  const [endDeleteDate, setEndDeleteDate] = useState<Date | undefined>()

  const { register, handleSubmit, setValue, reset } = useForm<FilterForm>({
    resolver: zodResolver(filterFormSchema),
  })

  useEffect(() => {
    const pPlate = searchParams.get('plate')
    const pStartTimeCreate = searchParams.get('startTimeCreate')
    const pEndTimeCreate = searchParams.get('endTimeCreate')
    const pStartTimeDelete = searchParams.get('startTimeDelete')
    const pEndTimeDelete = searchParams.get('endTimeDelete')

    if (pPlate) setValue('plate', pPlate)
    if (pStartTimeCreate) setValue('startTimeCreate', pStartTimeCreate)
    if (pEndTimeCreate) setValue('endTimeCreate', pEndTimeCreate)
    if (pStartTimeDelete) {
      setValue('startTimeDelete', pStartTimeDelete)
      setStartDeleteDate(new Date(pStartTimeDelete))
    }
    if (pEndTimeDelete) {
      setValue('endTimeDelete', pEndTimeDelete)
      setEndDeleteDate(new Date(pEndTimeDelete))
    }
  }, [])

  function handleClearFilters() {
    reset()
    setStartDeleteDate(undefined)
    setEndDeleteDate(undefined)
    router.replace(pathName)
  }

  async function onSubmit(props: FilterForm) {
    const params = new URLSearchParams()

    if (props.plate) params.set('plate', props.plate)
    if (props.startTimeCreate)
      params.set('startTimeCreate', props.startTimeCreate)
    if (props.endTimeCreate) params.set('endTimeCreate', props.endTimeCreate)
    if (props.startTimeDelete)
      params.set('startTimeDelete', props.startTimeDelete)
    if (props.endTimeDelete) params.set('endTimeDelete', props.endTimeDelete)

    router.replace(`${pathName}?${params.toString()}`)
  }

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="">
        <Label htmlFor="plate" className="text-xs text-muted-foreground">
          Placa
        </Label>
        <Input
          className="h-9 w-40"
          id="plate"
          type="text"
          {...register('plate')}
          onChange={(e) => setValue('plate', e.target.value.toUpperCase())}
        />
      </div>

      <div className="flex flex-col space-y-1">
        <Label className="text-xs text-muted-foreground">
          Data de exclusão
        </Label>
        <div className="flex items-center space-x-2">
          <div className="flex flex-col">
            <Label className="text-xs text-muted-foreground">De</Label>
            <DatePicker
              value={startDeleteDate}
              onChange={(date) => {
                setStartDeleteDate(date)
                setValue(
                  'startTimeDelete',
                  date instanceof Date ? date.toISOString() : undefined,
                )
              }}
              type="datetime-local"
              className="h-9 w-48"
            />
          </div>
          <div className="flex flex-col">
            <Label className="text-xs text-muted-foreground">Até</Label>
            <DatePicker
              value={endDeleteDate}
              onChange={(date) => {
                setEndDeleteDate(date)
                setValue(
                  'endTimeDelete',
                  date instanceof Date ? date.toISOString() : undefined,
                )
              }}
              type="datetime-local"
              className="h-9 w-48"
              fromDate={startDeleteDate}
            />
          </div>
        </div>
      </div>

      <Button size="sm" variant="outline" type="submit" className="space-x-1">
        <Search className="h-4 w-4" />
        <span>Filtrar</span>
      </Button>
      <Tooltip text="Limpar filtro" asChild>
        <Button
          size="sm"
          variant="secondary"
          type="button"
          onClick={handleClearFilters}
        >
          <FilterX className="h-4 w-4" />
          <span className="sr-only">Limpar filtro</span>
        </Button>
      </Tooltip>
    </form>
  )
}
