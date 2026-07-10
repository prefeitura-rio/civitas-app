'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
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

const activeOptions = ['all', 'true', 'false'] as const

const filterFormSchema = z.object({
  plateContains: z.string().toUpperCase().optional(),
  institutionAuthorityName: z.string().optional(),
  notificationChannelTitle: z.string().optional(),
  active: z.enum(activeOptions),
  createdAtFrom: z.string().optional(),
  createdAtTo: z.string().optional(),
})

type FilterForm = z.infer<typeof filterFormSchema>

function parseDateOnly(value: string | null) {
  if (!value) return undefined
  return new Date(`${value}T00:00:00`)
}

function formatDateOnly(date: Date | undefined) {
  if (!date) return undefined
  return format(date, 'yyyy-MM-dd')
}

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
    const pInstitutionAuthority = searchParams.get('institutionAuthorityName')
    const pChannel = searchParams.get('notificationChannelTitle')
    const pCreatedAtFrom = searchParams.get('createdAtFrom')
    const pCreatedAtTo = searchParams.get('createdAtTo')

    if (
      pActive &&
      activeOptions.includes(pActive as (typeof activeOptions)[number])
    ) {
      setValue('active', pActive as FilterForm['active'])
    }
    if (pPlate) setValue('plateContains', pPlate)
    if (pInstitutionAuthority)
      setValue('institutionAuthorityName', pInstitutionAuthority)
    if (pChannel) setValue('notificationChannelTitle', pChannel)
    if (pCreatedAtFrom) {
      setValue('createdAtFrom', pCreatedAtFrom)
      setCreatedAtFrom(parseDateOnly(pCreatedAtFrom))
    } else {
      setCreatedAtFrom(undefined)
    }
    if (pCreatedAtTo) {
      setValue('createdAtTo', pCreatedAtTo)
      setCreatedAtTo(parseDateOnly(pCreatedAtTo))
    } else {
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
    if (props.institutionAuthorityName)
      params.set('institutionAuthorityName', props.institutionAuthorityName)
    if (props.notificationChannelTitle)
      params.set('notificationChannelTitle', props.notificationChannelTitle)

    if (props.active && props.active !== 'all')
      params.set('active', props.active)
    if (props.createdAtFrom) params.set('createdAtFrom', props.createdAtFrom)
    if (props.createdAtTo) params.set('createdAtTo', props.createdAtTo)

    router.replace(`${pathName}?${params.toString()}`)
  }

  return (
    <form
      className="flex items-end space-x-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
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
          {...register('plateContains')}
          onChange={(e) =>
            setValue('plateContains', e.target.value.toUpperCase())
          }
        />
      </div>
      <div>
        <Label
          htmlFor="institutionAuthorityName"
          className="text-xs text-muted-foreground"
        >
          Autoridade
        </Label>
        <Input
          className="h-9 w-40"
          id="institutionAuthorityName"
          type="text"
          {...register('institutionAuthorityName')}
        />
      </div>
      <div>
        <Label
          htmlFor="notificationChannelTitle"
          className="text-xs text-muted-foreground"
        >
          Canal de notificação
        </Label>
        <Input
          className="h-9 w-40"
          id="notificationChannelTitle"
          type="text"
          {...register('notificationChannelTitle')}
        />
      </div>
      <div className="flex flex-col space-y-1">
        <div className="flex items-center space-x-2">
          <div className="flex flex-col">
            <Label className="mb-0.5 text-xs text-muted-foreground">
              Data de criação de:
            </Label>
            <DatePicker
              value={createdAtFrom}
              onChange={(date) => {
                const nextDate = date instanceof Date ? date : undefined
                setCreatedAtFrom(nextDate)
                setValue('createdAtFrom', formatDateOnly(nextDate))
              }}
              className="h-9 w-48"
            />
          </div>
          <div className="flex flex-col">
            <Label className="mb-0.5 text-xs text-muted-foreground">Até:</Label>
            <DatePicker
              value={createdAtTo}
              onChange={(date) => {
                const nextDate = date instanceof Date ? date : undefined
                setCreatedAtTo(nextDate)
                setValue('createdAtTo', formatDateOnly(nextDate))
              }}
              className="h-9 w-48"
              fromDate={createdAtFrom}
            />
          </div>
        </div>
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
