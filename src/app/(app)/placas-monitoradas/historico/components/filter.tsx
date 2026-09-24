'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
import { getInstitutionAuthorities } from '@/http/institution-authorities'
import { getRequestingInstitutions } from '@/http/requesting-institutions'
import { cn } from '@/lib/utils'

import {
  type FilterComboboxOption,
  MonitoredPlatesFilterCombobox,
} from '../../components/monitored-plates-filter/monitored-plates-filter-combobox'

const filterFormSchema = z
  .object({
    plate: z.string().toUpperCase().optional(),
    status: z.enum(['all', 'active', 'deactivated']).default('all'),
    requestingInstitutionId: z.string().default('all'),
    institutionAuthorityId: z.string().default('all'),
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

export function HistoryFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()
  const advancedOpenInitialized = useRef(false)

  const [startCreateDate, setStartCreateDate] = useState<Date | undefined>()
  const [endCreateDate, setEndCreateDate] = useState<Date | undefined>()
  const [startDeleteDate, setStartDeleteDate] = useState<Date | undefined>()
  const [endDeleteDate, setEndDeleteDate] = useState<Date | undefined>()
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<FilterForm>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      plate: '',
      status: 'all',
      requestingInstitutionId: 'all',
      institutionAuthorityId: 'all',
      referenceNumber: '',
      startTimeCreate: undefined,
      endTimeCreate: undefined,
      startTimeDelete: undefined,
      endTimeDelete: undefined,
    },
  })

  const [requestingInstitutionName, setRequestingInstitutionName] = useState('')
  const [requestingInstitutionSearch, setRequestingInstitutionSearch] =
    useState('')
  const [isRequestingInstitutionOpen, setIsRequestingInstitutionOpen] =
    useState(false)
  const [institutionAuthorityName, setInstitutionAuthorityName] = useState('')
  const [institutionAuthoritySearch, setInstitutionAuthoritySearch] =
    useState('')
  const [isAuthorityOpen, setIsAuthorityOpen] = useState(false)

  const plate = useWatch({ control, name: 'plate' })
  const status = useWatch({ control, name: 'status' })
  const requestingInstitutionId = useWatch({
    control,
    name: 'requestingInstitutionId',
  })
  const institutionAuthorityId = useWatch({
    control,
    name: 'institutionAuthorityId',
  })
  const referenceNumber = useWatch({ control, name: 'referenceNumber' })
  const debouncedRequestingInstitutionSearch = useDebounce(
    requestingInstitutionSearch,
    350,
  )
  const debouncedAuthoritySearch = useDebounce(institutionAuthoritySearch, 350)
  const startTimeCreate = useWatch({ control, name: 'startTimeCreate' })
  const endTimeCreate = useWatch({ control, name: 'endTimeCreate' })
  const startTimeDelete = useWatch({ control, name: 'startTimeDelete' })
  const endTimeDelete = useWatch({ control, name: 'endTimeDelete' })
  const advancedFilterCount = [
    startTimeCreate,
    endTimeCreate,
    startTimeDelete,
    endTimeDelete,
  ].filter(Boolean).length
  const hasActiveFilters =
    Boolean(plate?.trim()) ||
    Boolean(referenceNumber?.trim()) ||
    status !== 'all' ||
    requestingInstitutionId !== 'all' ||
    institutionAuthorityId !== 'all' ||
    advancedFilterCount > 0

  const pPlate = searchParams.get('plate') ?? ''
  const pStatus = searchParams.get('status')
  const pRequestingInstitutionId =
    searchParams.get('requestingInstitutionId') ?? 'all'
  const pInstitutionAuthorityId =
    searchParams.get('institutionAuthorityId') ?? 'all'
  const pReferenceNumber = searchParams.get('referenceNumber') ?? ''
  const pStartTimeCreate = searchParams.get('startTimeCreate')
  const pEndTimeCreate = searchParams.get('endTimeCreate')
  const pStartTimeDelete = searchParams.get('startTimeDelete')
  const pEndTimeDelete = searchParams.get('endTimeDelete')

  useEffect(() => {
    reset({
      plate: pPlate,
      status:
        pStatus === 'active' || pStatus === 'deactivated' ? pStatus : 'all',
      requestingInstitutionId: pRequestingInstitutionId || 'all',
      institutionAuthorityId: pInstitutionAuthorityId || 'all',
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
  }, [
    reset,
    pPlate,
    pStatus,
    pRequestingInstitutionId,
    pInstitutionAuthorityId,
    pReferenceNumber,
    pStartTimeCreate,
    pEndTimeCreate,
    pStartTimeDelete,
    pEndTimeDelete,
  ])

  const {
    data: requestingInstitutionsResponse,
    isLoading: isLoadingRequestingInstitutions,
  } = useQuery({
    queryKey: [
      'requesting-institutions',
      'history-filter',
      debouncedRequestingInstitutionSearch,
    ],
    queryFn: () =>
      getRequestingInstitutions({
        page: 1,
        size: 100,
        search: debouncedRequestingInstitutionSearch,
      }),
    enabled: isRequestingInstitutionOpen || requestingInstitutionId !== 'all',
  })

  const { data: authoritiesResponse, isLoading: isLoadingAuthorities } =
    useQuery({
      queryKey: [
        'institution-authorities',
        'history-filter',
        debouncedAuthoritySearch,
        requestingInstitutionId,
      ],
      queryFn: () =>
        getInstitutionAuthorities({
          page: 1,
          size: 20,
          search: debouncedAuthoritySearch,
          requestingInstitutionId:
            requestingInstitutionId === 'all'
              ? undefined
              : requestingInstitutionId,
        }),
      enabled: isAuthorityOpen || institutionAuthorityId !== 'all',
    })

  const requestingInstitutionOptions: FilterComboboxOption[] = (
    requestingInstitutionsResponse?.data.items ?? []
  ).map((item) => ({ id: item.id, label: item.name }))

  const authorityOptions: FilterComboboxOption[] = (
    authoritiesResponse?.data.items ?? []
  ).map((item) => ({ id: item.id, label: item.name }))

  useEffect(() => {
    if (requestingInstitutionId === 'all') {
      setRequestingInstitutionName('')
      return
    }
    const match = requestingInstitutionOptions.find(
      (item) => item.id === requestingInstitutionId,
    )
    if (match) setRequestingInstitutionName(match.label)
  }, [requestingInstitutionId, requestingInstitutionOptions])

  useEffect(() => {
    if (institutionAuthorityId === 'all') {
      setInstitutionAuthorityName('')
      return
    }
    const match = authorityOptions.find(
      (item) => item.id === institutionAuthorityId,
    )
    if (match) setInstitutionAuthorityName(match.label)
  }, [authorityOptions, institutionAuthorityId])

  function handleStatusChange(value: string) {
    setValue('status', value as FilterForm['status'], {
      shouldDirty: true,
    })
  }

  function handleClearFilters() {
    setAdvancedOpen(false)
    reset({
      plate: '',
      status: 'all',
      requestingInstitutionId: 'all',
      institutionAuthorityId: 'all',
      referenceNumber: '',
      startTimeCreate: undefined,
      endTimeCreate: undefined,
      startTimeDelete: undefined,
      endTimeDelete: undefined,
    })
    setRequestingInstitutionName('')
    setRequestingInstitutionSearch('')
    setInstitutionAuthorityName('')
    setInstitutionAuthoritySearch('')
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
    if (
      props.requestingInstitutionId &&
      props.requestingInstitutionId !== 'all'
    ) {
      params.set('requestingInstitutionId', props.requestingInstitutionId)
    }
    if (
      props.institutionAuthorityId &&
      props.institutionAuthorityId !== 'all'
    ) {
      params.set('institutionAuthorityId', props.institutionAuthorityId)
    }
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

  const applyFilters = handleSubmit(
    async (values) => {
      await onSubmit(values)
      setAdvancedOpen(false)
    },
    (formErrors) => {
      if (formErrors.endTimeCreate || formErrors.endTimeDelete) {
        setAdvancedOpen(true)
      }
    },
  )

  return (
    <form className="space-y-3" onSubmit={applyFilters}>
      <div className="flex w-full flex-wrap items-end gap-3">
        <div className="flex w-full min-w-0 flex-col gap-1 sm:w-auto sm:shrink-0">
          <Label htmlFor="plate" className="text-xs text-muted-foreground">
            Placa
          </Label>
          <Input
            className="h-10 w-full sm:h-9 sm:w-40"
            id="plate"
            type="text"
            {...register('plate')}
            onChange={(e) => setValue('plate', e.target.value.toUpperCase())}
          />
        </div>

        <div className="flex w-full min-w-0 flex-col gap-1 sm:w-auto sm:shrink-0">
          <Label
            htmlFor="referenceNumber"
            className="text-xs text-muted-foreground"
          >
            Número de referência
          </Label>
          <Input
            className="h-10 w-full sm:h-9 sm:w-48"
            id="referenceNumber"
            type="text"
            {...register('referenceNumber')}
          />
        </div>

        <div className="flex w-full min-w-0 flex-col gap-1 sm:w-auto sm:shrink-0">
          <Label
            htmlFor="history-requesting-institution"
            className="text-xs text-muted-foreground"
          >
            Demandante
          </Label>
          <MonitoredPlatesFilterCombobox
            id="history-requesting-institution"
            valueId={requestingInstitutionId ?? 'all'}
            valueLabel={requestingInstitutionName}
            allLabel="Todos"
            searchPlaceholder="Nome do demandante"
            options={requestingInstitutionOptions}
            isLoading={isLoadingRequestingInstitutions}
            search={requestingInstitutionSearch}
            onSearchChange={setRequestingInstitutionSearch}
            onOpenChange={setIsRequestingInstitutionOpen}
            triggerClassName="h-10 w-full sm:h-9 sm:w-52"
            onSelect={(option) => {
              setValue('institutionAuthorityId', 'all', { shouldDirty: true })
              setInstitutionAuthorityName('')
              setInstitutionAuthoritySearch('')
              if (!option) {
                setValue('requestingInstitutionId', 'all', {
                  shouldDirty: true,
                })
                setRequestingInstitutionName('')
                setRequestingInstitutionSearch('')
                return
              }
              setValue('requestingInstitutionId', option.id, {
                shouldDirty: true,
              })
              setRequestingInstitutionName(option.label)
            }}
          />
        </div>

        <div className="flex w-full min-w-0 flex-col gap-1 sm:w-auto sm:shrink-0">
          <Label
            htmlFor="history-authority"
            className="text-xs text-muted-foreground"
          >
            Requisitante
          </Label>
          <MonitoredPlatesFilterCombobox
            id="history-authority"
            valueId={institutionAuthorityId ?? 'all'}
            valueLabel={institutionAuthorityName}
            allLabel="Todos"
            searchPlaceholder="Nome do requisitante"
            options={authorityOptions}
            isLoading={isLoadingAuthorities}
            search={institutionAuthoritySearch}
            onSearchChange={setInstitutionAuthoritySearch}
            onOpenChange={setIsAuthorityOpen}
            triggerClassName="h-10 w-full sm:h-9 sm:w-52"
            onSelect={(option) => {
              if (!option) {
                setValue('institutionAuthorityId', 'all', { shouldDirty: true })
                setInstitutionAuthorityName('')
                setInstitutionAuthoritySearch('')
                return
              }
              setValue('institutionAuthorityId', option.id, {
                shouldDirty: true,
              })
              setInstitutionAuthorityName(option.label)
            }}
          />
        </div>

        <div className="flex w-full min-w-0 flex-col gap-1 sm:w-auto sm:shrink-0">
          <Label htmlFor="status" className="text-xs text-muted-foreground">
            Status
          </Label>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger id="status" className="h-10 w-full sm:h-9 sm:w-36">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="deactivated">Desativadas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid w-full gap-2 sm:ml-auto sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
          <Popover open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 w-full space-x-1 sm:h-9 sm:w-auto"
                aria-expanded={advancedOpen}
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    advancedOpen && 'rotate-180',
                  )}
                />
                <span>Período e mais filtros</span>
                {advancedFilterCount > 0 ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {advancedFilterCount}
                  </span>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[min(32rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Período e mais filtros</h3>
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
                      className="h-10 w-full sm:h-9"
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
                      className="h-10 w-full sm:h-9"
                      fromDate={startCreateDate}
                    />
                  </div>
                </div>
                {errors.endTimeCreate?.message ? (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.endTimeCreate.message}
                  </p>
                ) : null}
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
                      className="h-10 w-full sm:h-9"
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
                      className="h-10 w-full sm:h-9"
                      fromDate={startDeleteDate}
                    />
                  </div>
                </div>
                {errors.endTimeDelete?.message ? (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.endTimeDelete.message}
                  </p>
                ) : null}
              </div>
              <div className="flex justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-10 sm:h-9"
                  onClick={handleClearFilters}
                >
                  Limpar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-10 sm:h-9"
                  onClick={applyFilters}
                >
                  Aplicar filtros
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="h-10 w-full gap-2 sm:h-9 sm:w-auto"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
          <Button size="sm" type="submit" className="h-10 sm:h-9">
            Aplicar filtros
          </Button>
        </div>
      </div>
    </form>
  )
}
