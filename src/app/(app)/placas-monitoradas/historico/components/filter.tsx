'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { FilterX, Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
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

  const { register, handleSubmit, setValue, reset } = useForm<FilterForm>({
    resolver: zodResolver(filterFormSchema),
  })

  useEffect(() => {
    const pPlate = searchParams.get('plate')
    const pStartTimeCreate = searchParams.get('startTimeCreate')
    const pEndTimeCreate = searchParams.get('pEndTimeCreate')
    const pStartTimeDelete = searchParams.get('pStartTimeDelete')
    const pEndTimeDelete = searchParams.get('pEndTimeDelete')

    if (pPlate) setValue('plate', pPlate)
    if (pStartTimeCreate) setValue('plate', pStartTimeCreate)
    if (pEndTimeCreate) setValue('plate', pEndTimeCreate)
    if (pStartTimeDelete) setValue('plate', pStartTimeDelete)
    if (pEndTimeDelete) setValue('plate', pEndTimeDelete)
  }, [])

  function handleClearFilters() {
    reset()
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
      className="flex items-end space-x-2"
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
          // placeholder="Placa"
          {...register('plate')}
          onChange={(e) => setValue('plate', e.target.value.toUpperCase())}
        />
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
