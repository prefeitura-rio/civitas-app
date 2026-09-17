'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useDebounce } from '@/components/custom/multiselect-with-search'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const filterFormSchema = z
  .object({
    plate: z.string().toUpperCase().optional(),
    status: z.enum(['all', 'active', 'deactivated']).default('all'),
    source: z.enum(['all', 'legacy', 'authority']).default('all'),
    referenceNumber: z.string().optional(),
    startTimeCreate: z.string().optional(),
    endTimeCreate: z.string().optional(),
    startTimeDelete: z.string().optional(),
    endTimeDelete: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (
      values.startTimeCreate &&
      values.endTimeCreate &&
      new Date(values.startTimeCreate) > new Date(values.endTimeCreate)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endTimeCreate'],
        message: 'A data final deve ser posterior à data inicial.',
      })
    }
    if (
      values.startTimeDelete &&
      values.endTimeDelete &&
      new Date(values.startTimeDelete) > new Date(values.endTimeDelete)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endTimeDelete'],
        message: 'A data final deve ser posterior à data inicial.',
      })
    }
  })

type FilterForm = z.infer<typeof filterFormSchema>

function parseDate(value: string | null | undefined) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function countAdvancedFilters(values: FilterForm) {
  let count = 0
  if (values.startTimeCreate) count += 1
  if (values.endTimeCreate) count += 1
  if (values.startTimeDelete) count += 1
  if (values.endTimeDelete) count += 1
  return count
}

export function HistoryFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()
  const skipPlateSync = useRef(false)
  const skipReferenceSync = useRef(true)
  const advancedOpenInitialized = useRef(false)

  const [startCreateDate, setStartCreateDate] = useState<Date | undefined>()
  const [endCreateDate, setEndCreateDate] = useState<Date | undefined>()
  const [startDeleteDate, setStartDeleteDate] = useState<Date | undefined>()
  const [endDeleteDate, setEndDeleteDate] = useState<Date | undefined>()
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const { register, handleSubmit, setValue, reset, watch } =
    useForm<FilterForm>({
      resolver: zodResolver(filterFormSchema),
      defaultValues: {
        plate: '',
        status: 'all',
        source: 'all',
        referenceNumber: '',
        startTimeCreate: undefined,
        endTimeCreate: undefined,
        startTimeDelete: undefined,
        endTimeDelete: undefined,
      },
    })

  const status = watch('status')
  const source = watch('source')
  const formValues = watch()
  const debouncedPlate = useDebounce(
    formValues.plate?.trim().toUpperCase() ?? '',
    350,
  )
  const debouncedReferenceNumber = useDebounce(
    formValues.referenceNumber?.trim() ?? '',
    350,
  )

  const advancedFilterCount = useMemo(
    () => countAdvancedFilters(formValues),
    [formValues],
  )
  const hasActiveFilters =
    Boolean(debouncedPlate) ||
    Boolean(debouncedReferenceNumber) ||
    status !== 'all' ||
    source !== 'all' ||
    advancedFilterCount > 0

  useEffect(() => {
    const pPlate = searchParams.get('plate') ?? ''
    const pStatus = searchParams.get('status')
    const pSource = searchParams.get('source')
    const pReferenceNumber = searchParams.get('referenceNumber') ?? ''
    const pStartTimeCreate = searchParams.get('startTimeCreate')
    const pEndTimeCreate = searchParams.get('endTimeCreate')
    const pStartTimeDelete = searchParams.get('startTimeDelete')
    const pEndTimeDelete = searchParams.get('endTimeDelete')

    reset({
      plate: pPlate,
      status:
        pStatus === 'active' || pStatus === 'deactivated' ? pStatus : 'all',
      source:
        pSource === 'legacy' ||
        pSource === 'legacy_plate' ||
        pSource === 'authority'
          ? pSource === 'legacy_plate'
            ? 'legacy'
            : pSource
          : 'all',
      referenceNumber: pReferenceNumber,
      startTimeCreate: pStartTimeCreate ?? undefined,
      endTimeCreate: pEndTimeCreate ?? undefined,
      startTimeDelete: pStartTimeDelete ?? undefined,
      endTimeDelete: pEndTimeDelete ?? undefined,
    })

    setStartCreateDate(parseDate(pStartTimeCreate))
    setEndCreateDate(parseDate(pEndTimeCreate))
    setStartDeleteDate(parseDate(pStartTimeDelete))
    setEndDeleteDate(parseDate(pEndTimeDelete))

    if (!advancedOpenInitialized.current) {
      advancedOpenInitialized.current = true
      if (
        pStartTimeCreate ||
        pEndTimeCreate ||
        pStartTimeDelete ||
        pEndTimeDelete
      ) {
        setAdvancedOpen(true)
      }
    }
  }, [reset, searchParams])

  useEffect(() => {
    if (skipReferenceSync.current) {
      skipReferenceSync.current = false
      return
    }

    const currentReferenceNumber = searchParams.get('referenceNumber') ?? ''
    if (currentReferenceNumber === debouncedReferenceNumber) return

    const params = new URLSearchParams(searchParams.toString())
    if (debouncedReferenceNumber) {
      params.set('referenceNumber', debouncedReferenceNumber)
    } else {
      params.delete('referenceNumber')
    }
    params.set('page', '1')
    router.replace(`${pathName}?${params.toString()}`)
  }, [debouncedReferenceNumber, pathName, router, searchParams])

  function handleSelectFilterChange(name: 'status' | 'source', value: string) {
    setValue(name, value as FilterForm[typeof name])

    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') params.delete(name)
    else params.set(name, value)
    params.set('page', '1')
    router.replace(`${pathName}?${params.toString()}`)
  }

  useEffect(() => {
    if (skipPlateSync.current) {
      skipPlateSync.current = false
      return
    }

    const currentPlate = searchParams.get('plate') ?? ''
    if (currentPlate === debouncedPlate) return

    const params = new URLSearchParams(searchParams.toString())
    if (debouncedPlate) params.set('plate', debouncedPlate)
    else params.delete('plate')
    params.set('page', '1')
    router.replace(`${pathName}?${params.toString()}`)
  }, [debouncedPlate, pathName, router, searchParams])

  function handleClearFilters() {
    skipPlateSync.current = true
    skipReferenceSync.current = true
    setAdvancedOpen(false)
    reset({
      plate: '',
      status: 'all',
      source: 'all',
      referenceNumber: '',
      startTimeCreate: undefined,
      endTimeCreate: undefined,
      startTimeDelete: undefined,
      endTimeDelete: undefined,
    })
    setStartCreateDate(undefined)
    setEndCreateDate(undefined)
    setStartDeleteDate(undefined)
    setEndDeleteDate(undefined)

    const params = new URLSearchParams()
    const sortBy = searchParams.get('sortBy')
    const sortDirection = searchParams.get('sortDirection')
    const size = searchParams.get('size')

    if (sortBy) params.set('sortBy', sortBy)
    if (sortDirection) params.set('sortDirection', sortDirection)
    if (size && size !== '10') params.set('size', size)

    const query = params.toString()
    router.replace(query ? `${pathName}?${query}` : pathName)
  }

  async function onSubmit(props: FilterForm) {
    const params = new URLSearchParams()

    if (props.plate?.trim())
      params.set('plate', props.plate.trim().toUpperCase())
    if (props.status && props.status !== 'all')
      params.set('status', props.status)
    if (props.source && props.source !== 'all')
      params.set('source', props.source)
    if (props.referenceNumber?.trim()) {
      params.set('referenceNumber', props.referenceNumber.trim())
    }
    if (props.startTimeCreate)
      params.set('startTimeCreate', props.startTimeCreate)
    if (props.endTimeCreate) params.set('endTimeCreate', props.endTimeCreate)
    if (props.startTimeDelete)
      params.set('startTimeDelete', props.startTimeDelete)
    if (props.endTimeDelete) params.set('endTimeDelete', props.endTimeDelete)

    const sortBy = searchParams.get('sortBy')
    const sortDirection = searchParams.get('sortDirection')
    const size = searchParams.get('size')
    if (sortBy) params.set('sortBy', sortBy)
    if (sortDirection) params.set('sortDirection', sortDirection)
    if (size && size !== '10') params.set('size', size)
    params.set('page', '1')

    router.replace(`${pathName}?${params.toString()}`)
  }

  const handleApply = handleSubmit(async (values) => {
    await onSubmit(values)
    setAdvancedOpen(false)
  })

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex w-full flex-wrap items-end gap-2">
        <div className="shrink-0">
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

        <div className="shrink-0">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => handleSelectFilterChange('status', value)}
          >
            <SelectTrigger className="h-9 w-36">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="deactivated">Desativadas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="shrink-0">
          <Label className="text-xs text-muted-foreground">Origem</Label>
          <Select
            value={source}
            onValueChange={(value) => handleSelectFilterChange('source', value)}
          >
            <SelectTrigger className="h-9 w-36">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="legacy">Legado</SelectItem>
              <SelectItem value="authority">Vínculo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="shrink-0">
          <Label
            htmlFor="referenceNumber"
            className="text-xs text-muted-foreground"
          >
            Nº de referência
          </Label>
          <Input
            className="h-9 w-48"
            id="referenceNumber"
            type="text"
            {...register('referenceNumber')}
          />
        </div>

        <div className="ml-auto flex shrink-0 flex-wrap items-end justify-end gap-2">
          <Popover open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="space-x-1"
                aria-expanded={advancedOpen}
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    advancedOpen && 'rotate-180',
                  )}
                />
                <span>Mais filtros</span>
                {advancedFilterCount > 0 ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {advancedFilterCount}
                  </span>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[min(32rem,calc(100vw-2rem))] space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Mais filtros</h3>
              </div>
              <div className="flex flex-col space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Data de criação
                </Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex min-w-0 flex-col">
                    <Label className="text-xs text-muted-foreground">De</Label>
                    <DatePicker
                      value={startCreateDate}
                      onChange={(date) => {
                        setStartCreateDate(date)
                        setValue(
                          'startTimeCreate',
                          date instanceof Date ? date.toISOString() : undefined,
                          {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          },
                        )
                      }}
                      type="datetime-local"
                      className="h-9 w-full"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <Label className="text-xs text-muted-foreground">Até</Label>
                    <DatePicker
                      value={endCreateDate}
                      onChange={(date) => {
                        setEndCreateDate(date)
                        setValue(
                          'endTimeCreate',
                          date instanceof Date ? date.toISOString() : undefined,
                          {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          },
                        )
                      }}
                      type="datetime-local"
                      className="h-9 w-full"
                      fromDate={startCreateDate}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Data de desativação
                </Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex min-w-0 flex-col">
                    <Label className="text-xs text-muted-foreground">De</Label>
                    <DatePicker
                      value={startDeleteDate}
                      onChange={(date) => {
                        setStartDeleteDate(date)
                        setValue(
                          'startTimeDelete',
                          date instanceof Date ? date.toISOString() : undefined,
                          {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          },
                        )
                      }}
                      type="datetime-local"
                      className="h-9 w-full"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <Label className="text-xs text-muted-foreground">Até</Label>
                    <DatePicker
                      value={endDeleteDate}
                      onChange={(date) => {
                        setEndDeleteDate(date)
                        setValue(
                          'endTimeDelete',
                          date instanceof Date ? date.toISOString() : undefined,
                          {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          },
                        )
                      }}
                      type="datetime-local"
                      className="h-9 w-full"
                      fromDate={startDeleteDate}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Limpar
                </Button>
                <Button type="button" size="sm" onClick={handleApply}>
                  Aplicar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="gap-2"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
        </div>
      </div>
    </form>
  )
}
