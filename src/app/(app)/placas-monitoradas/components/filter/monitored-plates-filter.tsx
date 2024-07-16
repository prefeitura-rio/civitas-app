'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { FilterX, Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip } from '@/components/ui/tooltip'

const activeOptions = ['all', 'true', 'false']

const filterFormSchema = z.object({
  plateContains: z.string().toUpperCase().optional(),
  operationTitle: z.string().optional(),
  notificationChannelTitle: z.string().optional(),
  active: z.enum([activeOptions[0], ...activeOptions]),
})

type FilterForm = z.infer<typeof filterFormSchema>

export function MonitoredPlatesFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()

  const { register, handleSubmit, setValue, reset, control } =
    useForm<FilterForm>({
      resolver: zodResolver(filterFormSchema),
      defaultValues: {
        active: 'all',
      },
    })

  useEffect(() => {
    const pActive = searchParams.get('active')
    const pPlate = searchParams.get('plateContains')
    const pOperation = searchParams.get('operationTitle')
    const pChannel = searchParams.get('notificationChannelTitle')

    if (pActive) setValue('active', pActive)
    if (pPlate) setValue('plateContains', pPlate)
    if (pOperation) setValue('operationTitle', pOperation)
    if (pChannel) setValue('notificationChannelTitle', pChannel)
  }, [])

  function handleClearFilters() {
    console.log('clear')
    reset()
    setValue('active', 'all')
    router.replace(pathName)
  }

  async function onSubmit(props: FilterForm) {
    const params = new URLSearchParams()

    if (props.plateContains) params.set('plateContains', props.plateContains)
    if (props.operationTitle) params.set('operationTitle', props.operationTitle)
    if (props.notificationChannelTitle)
      params.set('notificationChannelTitle', props.notificationChannelTitle)

    if (props.active && props.active !== 'all')
      params.set('active', props.active)

    console.log({ params: params.toString() })
    router.replace(`${pathName}?${params.toString()}`)
  }

  return (
    <form
      className="flex items-end space-x-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="">
        <Label
          htmlFor="plateContains"
          className="text-xs text-muted-foreground"
        >
          Placa
        </Label>
        <Input
          className="h-9 w-40"
          id="plateContains"
          type="text"
          // placeholder="Placa"
          {...register('plateContains')}
          onChange={(e) =>
            setValue('plateContains', e.target.value.toUpperCase())
          }
        />
      </div>
      <div className="">
        <Label
          htmlFor="operationTitle"
          className="text-xs text-muted-foreground"
        >
          Operação
        </Label>
        <Input
          className="h-9 w-40"
          id="operationTitle"
          type="text"
          // placeholder="Operação"
          {...register('operationTitle')}
        />
      </div>
      <div>
        <Label
          htmlFor="notificationChannelTitle"
          className="text-xs text-muted-foreground"
        >
          Cana de notificação
        </Label>
        <Input
          className="h-9 w-40"
          id="notificationChannelTitle"
          type="text"
          {...register('notificationChannelTitle')}
        />
      </div>
      <Controller
        control={control}
        name="active"
        render={({ field }) => (
          <div>
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select
              onValueChange={field.onChange}
              defaultValue="all"
              value={field.value}
            >
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      />

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
