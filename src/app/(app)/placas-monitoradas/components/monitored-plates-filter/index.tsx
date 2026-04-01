'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { FilterX, Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const activeOptions = ['all', 'true', 'false']

const filterFormSchema = z.object({
  plateContains: z.string().toUpperCase().optional(),
  organizationName: z.string().optional(),
  notificationChannelTitle: z.string().optional(),
  active: z.enum([activeOptions[0], ...activeOptions]),
  createdAtFrom: z.string().optional(),
  createdAtTo: z.string().optional(),
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

  const [createdAtFrom, setCreatedAtFrom] = useState<Date | undefined>()
  const [createdAtTo, setCreatedAtTo] = useState<Date | undefined>()

  useEffect(() => {
    const pActive = searchParams.get('active')
    const pPlate = searchParams.get('plateContains')
    const pOrg =
      searchParams.get('organizationName') || searchParams.get('operationTitle')
    const pChannel = searchParams.get('notificationChannelTitle')
    const pCreatedAtFrom = searchParams.get('createdAtFrom')
    const pCreatedAtTo = searchParams.get('createdAtTo')

    if (pActive === 'true' || pActive === 'false') setValue('active', pActive)
    else setValue('active', 'all')

    if (pPlate) setValue('plateContains', pPlate)
    if (pOrg) setValue('organizationName', pOrg)
    if (pChannel) setValue('notificationChannelTitle', pChannel)
    if (pCreatedAtFrom) {
      setValue('createdAtFrom', pCreatedAtFrom)
      setCreatedAtFrom(new Date(pCreatedAtFrom))
    } else {
      setValue('createdAtFrom', undefined)
      setCreatedAtFrom(undefined)
    }
    if (pCreatedAtTo) {
      setValue('createdAtTo', pCreatedAtTo)
      setCreatedAtTo(new Date(pCreatedAtTo))
    } else {
      setValue('createdAtTo', undefined)
      setCreatedAtTo(undefined)
    }
  }, [searchParams, setValue])
  function handleClearFilters() {
    reset()
    setValue('active', 'all')
    setCreatedAtFrom(undefined)
    setCreatedAtTo(undefined)
    router.replace(pathName)
  }

  async function onSubmit(props: FilterForm) {
    const params = new URLSearchParams()

    if (props.plateContains) params.set('plateContains', props.plateContains)
    if (props.organizationName)
      params.set('organizationName', props.organizationName)
    if (props.notificationChannelTitle)
      params.set('notificationChannelTitle', props.notificationChannelTitle)

    if (props.active && props.active !== 'all')
      params.set('active', props.active)
    if (props.createdAtFrom) params.set('createdAtFrom', props.createdAtFrom)
    if (props.createdAtTo) params.set('createdAtTo', props.createdAtTo)

    router.replace(`${pathName}?${params.toString()}`)
  }

  /** Largura fixa modesta: filtro compacto e alinhado entre si. */
  const fieldWrap =
    'min-w-[10.5rem] w-[10.5rem] max-w-full sm:w-[12rem] space-y-0.5'
  const datePickerClass =
    'h-8 min-w-[10.5rem] w-[10.5rem] max-w-full sm:min-w-[12rem] sm:w-[12rem] justify-start text-xs'

  return (
    <form
      className="w-full rounded-lg border border-border bg-card/40 px-2.5 py-2 shadow-sm"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-2">
        <div className={fieldWrap}>
          <Label
            htmlFor="plateContains"
            className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground"
          >
            Placa
          </Label>
          <Input
            className="h-8 w-full text-sm"
            id="plateContains"
            type="text"
            {...register('plateContains')}
            onChange={(e) =>
              setValue('plateContains', e.target.value.toUpperCase())
            }
          />
        </div>
        <div className={fieldWrap}>
          <Label
            htmlFor="organizationName"
            className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground"
          >
            Organização
          </Label>
          <Input
            className="h-8 w-full text-sm"
            id="organizationName"
            type="text"
            {...register('organizationName')}
          />
        </div>
        <div className={fieldWrap}>
          <Label
            htmlFor="notificationChannelTitle"
            className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground"
          >
            Canal
          </Label>
          <Input
            className="h-8 w-full text-sm"
            id="notificationChannelTitle"
            type="text"
            {...register('notificationChannelTitle')}
          />
        </div>
        <Controller
          control={control}
          name="active"
          render={({ field }) => (
            <div className={fieldWrap}>
              <Label className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                Vínculo
              </Label>
              <Select
                onValueChange={field.onChange}
                defaultValue="all"
                value={field.value}
              >
                <SelectTrigger className="h-8 w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Qualquer</SelectItem>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />
        <div className={fieldWrap}>
          <Label className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
            Criação · de
          </Label>
          <DatePicker
            value={createdAtFrom}
            onChange={(date) => {
              setCreatedAtFrom(date)
              setValue(
                'createdAtFrom',
                date instanceof Date ? date.toISOString() : undefined,
              )
            }}
            type="datetime-local"
            className={datePickerClass}
          />
        </div>
        <div className={fieldWrap}>
          <Label className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
            Criação · até
          </Label>
          <DatePicker
            value={createdAtTo}
            onChange={(date) => {
              setCreatedAtTo(date)
              setValue(
                'createdAtTo',
                date instanceof Date ? date.toISOString() : undefined,
              )
            }}
            type="datetime-local"
            className={datePickerClass}
            fromDate={createdAtFrom}
          />
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pb-0.5">
          <Button
            size="sm"
            variant="secondary"
            type="submit"
            className="h-8 gap-1 px-3 text-xs"
          >
            <Search className="size-3.5" />
            Filtrar
          </Button>
          <Tooltip text="Limpar filtro" asChild>
            <Button
              size="sm"
              variant="outline"
              type="button"
              className="h-8 px-2"
              onClick={handleClearFilters}
            >
              <FilterX className="size-3.5" />
              <span className="sr-only">Limpar filtro</span>
            </Button>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
